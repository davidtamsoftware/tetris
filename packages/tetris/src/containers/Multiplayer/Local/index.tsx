import * as React from "react";
import { Models, Multiplayer as MultiplayerAction } from "tetris-core";
import { Multiplayer } from "..";

class App extends React.Component<{}, MultiplayerAction.MultiplayerState> {

  private multiplayer: MultiplayerAction.Multiplayer;

  constructor(props: {}) {
    super(props)
    this.multiplayer = new MultiplayerAction.Multiplayer();
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
      this.multiplayer.rotateLeft(MultiplayerAction.Player.One);
    } else if (event.keyCode === 38) {
      this.multiplayer.rotateRight(MultiplayerAction.Player.One);
    } else if (event.keyCode === 39) {
      this.multiplayer.moveRight(MultiplayerAction.Player.One);
    } else if (event.keyCode === 37) {
      this.multiplayer.moveLeft(MultiplayerAction.Player.One);
    } else if (event.keyCode === 40) {
      this.multiplayer.drop(MultiplayerAction.Player.One, false);
    } else if (event.keyCode === 32) {
      this.multiplayer.drop(MultiplayerAction.Player.One, false, true);
    } else if (event.keyCode === 69) {
      this.multiplayer.rotateLeft(MultiplayerAction.Player.Two);
    } else if (event.keyCode === 38) {
      this.multiplayer.rotateRight(MultiplayerAction.Player.Two);
    } else if (event.keyCode === 70) {
      this.multiplayer.moveRight(MultiplayerAction.Player.Two);
    } else if (event.keyCode === 83) {
      this.multiplayer.moveLeft(MultiplayerAction.Player.Two);
    } else if (event.keyCode === 68) {
      this.multiplayer.drop(MultiplayerAction.Player.Two, false);
    } else if (event.keyCode === 65) {
      this.multiplayer.drop(MultiplayerAction.Player.Two, false, true);
    }
  }
}

export default App;
