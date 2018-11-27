import * as React from "react";
import { Handler, MultiplayerState } from "src/actions/Multiplayer";
import { GameState } from "../../models";
import "./index.css";
import { Multiplayer } from "./Multiplayer";

class MultiplayerRemoteClient {
    private subscribers: Set<Handler>;
    private multiplayerState: MultiplayerState;

    // tslint:disable-next-line:no-empty
    constructor() {
        // client.onReceivedMsg(setState)
    }

    public moveLeft() {
        // client.sendMsg()
        return;
    }

    public moveRight() {
        return;
    }

    public rotateRight() {
        return;
    }

    public rotateLeft() {
        return;
    }

    public togglePause() {
        return;
    }

    public drop(): Promise<void> {
        return Promise.resolve();
    }

    public endGame() {
        return;
    }

    public start() {
        this.restart();
    }

    public restart() {
        return;
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

}

// tslint:disable-next-line:max-classes-per-file
class App extends React.Component<{}, MultiplayerState> {

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

  private handle(multiplayerState: MultiplayerState) {
    this.setState({
      ...multiplayerState,
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.state.gameState === GameState.GameOver && event.keyCode === 82) {
      this.multiplayer.restart();
    } else if (this.state.gameState !== GameState.GameOver && event.keyCode === 80) {
      this.multiplayer.togglePause();
    } else if (this.state.gameState !== GameState.Active) {
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
