import { Multiplayer as MultiplayerAction } from "tetris-core";
import { Action, ClientMessage, ServerMessage, ResponseType, MatchEvent, MatchState } from "tetris-ws-model";
import { EventHandler, Event } from "tetris-core/lib/actions/Tetris";
import { GameState } from "tetris-core/lib/models";

type Handler = (game: any) => void;
type MatchEventHandler = (event: MatchEvent) => void;
type MatchStateHandler = (matchState: MatchState) => void;

export class MultiplayerRemoteClient {
  private subscribers: Set<Handler>;
  private eventSubscribers: Map<EventHandler, Event[]>;
  private matchEventSubscribers: Set<MatchEventHandler>;
  private matchStateSubscribers: Set<MatchStateHandler>;

  private multiplayerState: MultiplayerAction.MultiplayerState;
  private client?: WebSocket;

  constructor() {
    this.multiplayerState = {} as any;
    this.subscribers = new Set<Handler>();
    this.eventSubscribers = new Map<EventHandler, Event[]>();
    this.matchEventSubscribers = new Set<Handler>();
    this.matchStateSubscribers = new Set<MatchStateHandler>();
  }

  public disconnect() {
    this.client!.close();
  }

  public join(matchId: string) {
    // const wsUrl = "ws://192.168.1.72:8080";
    const wsUrl = "wss://hidden-tundra-30225.herokuapp.com";
    this.client = new WebSocket(wsUrl);

    // this.client!.onerror = (event) => alert(JSON.stringify(event));

    const payload: ClientMessage = {
      action: Action.Joinmatch,
      matchId,
    };

    this.client!.addEventListener("open", () => {
      this.client!.send(JSON.stringify(payload));
    });

    this.client!.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        if (message.type === ResponseType.GameState) {
          this.setState(message.payload);
        } else if (message.type === ResponseType.GameEvent) {
          this.publishEvent(message.payload);
        } else if (message.type === ResponseType.MatchEvent) {
          this.publishMatchEvent(message.payload);
        } else if (message.type === ResponseType.MatchState) {
          this.publishStateEvent(message.payload);
        }
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.log("error parsing: ", event);
      }
    }

    this.client!.onclose = (event) => {
      if (this.getState().gameState && this.getState().gameState !== GameState.GameOver) {
        this.publishEvent(Event.GameOver);
      }
      this.publishMatchEvent(MatchEvent.DISCONNECTED);
    }
  }

  public moveLeft() {
    const payload: ClientMessage = {
      action: Action.MoveLeft,
    };
    this.client!.send(JSON.stringify(payload));
  }

  public moveRight() {
    const payload: ClientMessage = {
      action: Action.MoveRight,
    };
    this.client!.send(JSON.stringify(payload));
  }

  public rotateRight() {
    const payload: ClientMessage = {
      action: Action.RotateRight,
    };
    this.client!.send(JSON.stringify(payload));
    this.publishEvent(Event.RotateRight);
  }

  public rotateLeft() {
    const payload: ClientMessage = {
      action: Action.RotateLeft,
    };
    this.client!.send(JSON.stringify(payload));
    this.publishEvent(Event.RotateLeft);
  }

  public togglePause() {
    const payload: ClientMessage = {
      action: Action.MoveRight, // TODO
    };
    this.client!.send(JSON.stringify(payload));
    // this.publishEvent(Event.PauseIn);
    // TODO: determine when to publish pause out
  }

  public drop(hardDrop?: boolean) {
    const payload: ClientMessage = {
      action: hardDrop ? Action.HardDrop : Action.SoftDrop,
    };
    this.client!.send(JSON.stringify(payload));
  }

  public endGame() {
    return;
  }

  public start() {
    this.restart();
  }

  public restart() {
    const payload: ClientMessage = {
      action: Action.Restart,
    };
    this.client!.send(JSON.stringify(payload));
  }

  public getState() {
    return this.multiplayerState;
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

  private setState(state: any) {
    // mutate state
    this.multiplayerState = {
      ...this.multiplayerState,
      ...state,
      winner: state.winner,
    }

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
}
