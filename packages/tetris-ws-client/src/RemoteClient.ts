import GameActions from "tetris-core/lib/actions/GameActions";
import { Handler, MultiplayerState } from "tetris-core/lib/actions/Multiplayer";
import PlayerActions from "tetris-core/lib/actions/PlayerActions";
import { Event, EventHandler } from "tetris-core/lib/actions/Tetris";
import { GameState } from "tetris-core/lib/models";
import {
  Action, ClientMessage, MatchEvent, MatchState, ResponseType,
  ServerMessage,
} from "tetris-ws-model";

type MatchEventHandler = (event: MatchEvent) => void;
type MatchStateHandler = (matchState: MatchState) => void;

export class MultiplayerRemoteClient implements PlayerActions, GameActions {
  private subscribers: Set<Handler>;
  private eventSubscribers: Map<EventHandler, Event[]>;
  private matchEventSubscribers: Set<MatchEventHandler>;
  private matchStateSubscribers: Set<MatchStateHandler>;

  private multiplayerState: MultiplayerState;
  private client?: WebSocket;

  private wsUrl: string;

  private buffer: ClientMessage[];

  constructor(wsUrl: string, private batchIntervalMs: number = 0, private maxBufferLength: number = Number.MAX_VALUE) {
    this.wsUrl = wsUrl;
    this.multiplayerState = {} as any;
    this.subscribers = new Set<Handler>();
    this.eventSubscribers = new Map<EventHandler, Event[]>();
    this.matchEventSubscribers = new Set<MatchEventHandler>();
    this.matchStateSubscribers = new Set<MatchStateHandler>();
    this.buffer = [];
  }

  public disconnect() {
    this.client!.close();
  }

  public join(matchId: string) {
    this.client = new WebSocket(this.wsUrl);

    // this.client!.onerror = (event) => alert(JSON.stringify(event));

    const payload: ClientMessage = {
      action: Action.Joinmatch,
      matchId,
    };

    this.client!.addEventListener("open", () => {
      this.produce(payload);
    });

    this.client!.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        if (message.type === ResponseType.GameState) {
          const state = message.payload as MultiplayerState;
          if (this.getState().gameState === GameState.Active && state.gameState === GameState.Paused) {
            // calculate if pause in event is needed locally instead of sending from server
            this.publishEvent(Event.PauseIn);
          } else if (this.getState().gameState === GameState.Paused && state.gameState === GameState.Active) {
            // calculate if pause out event is needed locally instead of sending from server
            this.publishEvent(Event.PauseOut);
          }
          this.setState(state);
        } else if (message.type === ResponseType.GameEvent) {
          this.publishEvent(message.payload as Event);
        } else if (message.type === ResponseType.MatchEvent) {
          this.publishMatchEvent(message.payload as MatchEvent);
        } else if (message.type === ResponseType.MatchState) {
          this.publishStateEvent(message.payload as MatchState);
        }
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.log("error parsing: ", event);
      }
    };

    this.client!.onclose = (event) => {
      if (this.getState().gameState && this.getState().gameState !== GameState.GameOver) {
        this.publishEvent(Event.GameOver);
      }
      this.publishMatchEvent(MatchEvent.DISCONNECTED);
    };
  }

  public moveLeft() {
    const payload: ClientMessage = {
      action: Action.MoveLeft,
    };
    this.produce(payload);
  }

  public moveRight() {
    const payload: ClientMessage = {
      action: Action.MoveRight,
    };
    this.produce(payload);
  }

  public rotateRight() {
    const payload: ClientMessage = {
      action: Action.RotateRight,
    };
    this.produce(payload);
    this.publishEvent(Event.RotateRight);
  }

  public rotateLeft() {
    const payload: ClientMessage = {
      action: Action.RotateLeft,
    };
    this.produce(payload);
    this.publishEvent(Event.RotateLeft);
  }

  public togglePause() {
    const payload: ClientMessage = {
      action: Action.TogglePause,
    };
    this.produce(payload);
  }

  public drop(hardDrop?: boolean) {
    const payload: ClientMessage = {
      action: hardDrop ? Action.HardDrop : Action.SoftDrop,
    };
    this.produce(payload);
  }

  public start() {
    this.restart();
  }

  public restart() {
    const payload: ClientMessage = {
      action: Action.Restart,
    };
    this.produce(payload);
  }

  public endGame() {
    this.disconnect();
  }

  public getState() {
    // deep copy
    return JSON.parse(JSON.stringify(this.multiplayerState || {}));
  }

  public subscribe(handler: Handler) {
    this.subscribers.add(handler);
  }

  public unsubscribe(handler: Handler) {
    this.subscribers.delete(handler);
  }

  public subscribeToEvent(handler: EventHandler, ...events: Event[]) {
    this.eventSubscribers.set(handler, events);
  }

  public unsubscribeToEvent(handler: EventHandler) {
    this.eventSubscribers.delete(handler);
  }

  public subscribeToMatchEvent(handler: MatchEventHandler) {
    this.matchEventSubscribers.add(handler);
  }

  public unsubscribeToMatchEvent(handler: MatchEventHandler) {
    this.matchEventSubscribers.delete(handler);
  }

  public subscribeToMatchState(handler: MatchStateHandler) {
    this.matchStateSubscribers.add(handler);
  }

  public unsubscribeToMatchState(handler: MatchStateHandler) {
    this.matchStateSubscribers.delete(handler);
  }

  private setState(state: MultiplayerState) {
    // mutate state
    this.multiplayerState = {
      ...this.multiplayerState,
      ...state,
      winner: state.winner,
    };

    this.notify();
  }

  private notify = () => {
    this.subscribers.forEach((subscriber) => subscriber(this.multiplayerState));
  }

  private publishEvent = (event: Event) => {
    this.eventSubscribers.forEach((events, handler) => {
      if (events.length === 0 || events.indexOf(event) >= 0) {
        handler(event);
      }
    });
  }

  private publishMatchEvent = (event: MatchEvent) => {
    this.matchEventSubscribers.forEach((handler) => handler(event));
  }

  private publishStateEvent = (state: MatchState) => {
    this.matchStateSubscribers.forEach((handler) => handler(state));
  }

  private produce = (clientMessage: ClientMessage) => {
    if (this.batchIntervalMs > 0) {
      this.buffer.push(clientMessage);
      if (this.buffer.length === 1) {
        setTimeout(() => {
          // tslint:disable-next-line:no-console
          // console.log("buffer size:", this.buffer.length,
          // this.buffer.slice(this.buffer.length - this.maxBufferLength));
          this.client!.send(JSON.stringify(this.buffer.slice(this.buffer.length - this.maxBufferLength)));
          this.buffer = [];
        }, this.batchIntervalMs);
      }
    } else {
      this.client!.send(JSON.stringify([clientMessage]));
    }
  }
}
