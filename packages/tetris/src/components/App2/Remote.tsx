import * as React from "react";
import { Models, Multiplayer as MultiplayerAction} from "tetris-core";
// import { Handler, MultiplayerState } from "src/actions/Multiplayer";
// import { GameState } from "../../models";
import "./index.css";
import { Multiplayer } from "./Multiplayer";

enum Action {
  Joinmatch,
  MoveLeft,
  MoveRight,
  SoftDrop,
  HardDrop,
  RotateLeft,
  RotateRight,
  Restart,
}

interface Message {
  action: Action;
  matchId?: string;
}

type Handler = (game: any) => void;

export class MultiplayerRemoteClient {
  private subscribers: Set<Handler>;
  private multiplayerState: MultiplayerAction.MultiplayerState;
  private client: WebSocket;
  // tslint:disable-next-line:no-empty
  constructor() {
    this.client = new WebSocket("ws://192.168.1.70:8080");
    this.subscribers = new Set<Handler>();

    const payload: Message = {
      action: Action.Joinmatch,
      matchId: "a1",
    };
    this.client.addEventListener("open", (event) => {
      this.client.send(JSON.stringify(payload));
    });
    this.client.onmessage = (event) => {
      try {
        this.setState(JSON.parse(event.data));
      } catch (error) {
        // tslint:disable-next-line:no-console
        console.log("error parsing: ", event);
      }
    }
  }

  public moveLeft() {
    const payload: Message = {
      action: Action.MoveLeft,
    };
    this.client.send(JSON.stringify(payload));
  }

  public moveRight() {
    const payload: Message = {
      action: Action.MoveRight,
    };
    this.client.send(JSON.stringify(payload));
  }

  public rotateRight() {
    const payload: Message = {
      action: Action.RotateRight,
    };
    this.client.send(JSON.stringify(payload));
  }

  public rotateLeft() {
    const payload: Message = {
      action: Action.RotateLeft,
    };
    this.client.send(JSON.stringify(payload));
  }

  public togglePause() {
    const payload: Message = {
      action: Action.MoveRight, // TODO
    };
    this.client.send(JSON.stringify(payload));
  }

  public drop(hardDrop?: boolean) {
    const payload: Message = {
      action: hardDrop ? Action.HardDrop : Action.SoftDrop,
    };
    this.client.send(JSON.stringify(payload));
  }

  public endGame() {
    return;
  }

  public start() {
    this.restart();
  }

  public restart() {
    const payload: Message = {
      action: Action.Restart,
    };
    this.client.send(JSON.stringify(payload));
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

  private setState(state: any) {
    // mutate state
    this.multiplayerState = {
      ...this.multiplayerState,
      ...state,
    }

    this.notify();
  }

  private notify = () => {
    this.subscribers.forEach((subscriber) => subscriber(this.multiplayerState));
  }
}

// tslint:disable-next-line:max-classes-per-file
class App extends React.Component<{}, MultiplayerAction.MultiplayerState> {

  private multiplayer: MultiplayerRemoteClient;

  constructor(props: {}) {
    super(props)
    this.multiplayer = new MultiplayerRemoteClient();
    this.state = this.multiplayer.getState();
    this.handle = this.handle.bind(this);
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.multiplayer.subscribe(this.handle);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.multiplayer.unsubscribe(this.handle);
  }

  public componentDidMount() {
    this.multiplayer.start();
  }

  public render() {
    return <Multiplayer {...this.state} />;
  }

  private handle(multiplayerState: MultiplayerAction.MultiplayerState) {
    this.setState({
      ...multiplayerState,
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.state.gameState === Models.GameState.GameOver && event.keyCode === 82) {
      this.multiplayer.restart();
    } else if (this.state.gameState !== Models.GameState.GameOver && event.keyCode === 80) {
      this.multiplayer.togglePause();
    } else if (this.state.gameState !== Models.GameState.Active) {
      return;
    } else if (event.keyCode === 90) {
      this.multiplayer.rotateLeft();
    } else if (event.keyCode === 38) {
      this.multiplayer.rotateRight();
    } else if (event.keyCode === 39) {
      this.multiplayer.moveRight();
    } else if (event.keyCode === 37) {
      this.multiplayer.moveLeft();
    } else if (event.keyCode === 40) {
      this.multiplayer.drop();
    } else if (event.keyCode === 32) {
      this.multiplayer.drop();
    }
  }
}

export default App;
