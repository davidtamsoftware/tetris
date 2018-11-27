import * as React from "react";
import { Multiplayer as MultiplayerGame, MultiplayerState, Player } from "src/actions/Multiplayer";
import { GameState } from "../../models";
import "./index.css";
import { Multiplayer } from "./Multiplayer";

class App extends React.Component<{}, MultiplayerState> {

  private multiplayer: MultiplayerGame;

  constructor(props: {}) {
    super(props)
    this.multiplayer = new MultiplayerGame();
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
      this.multiplayer.rotateLeft(Player.One);
    } else if (event.keyCode === 38) {
      this.multiplayer.rotateRight(Player.One);
    } else if (event.keyCode === 39) {
      this.multiplayer.moveRight(Player.One);
    } else if (event.keyCode === 37) {
      this.multiplayer.moveLeft(Player.One);
    } else if (event.keyCode === 40) {
      this.multiplayer.drop(Player.One, false);
    } else if (event.keyCode === 32) {
      this.multiplayer.drop(Player.One, false, true);
    } else if (event.keyCode === 69) {
      this.multiplayer.rotateLeft(Player.Two);
    } else if (event.keyCode === 38) {
      this.multiplayer.rotateRight(Player.Two);
    } else if (event.keyCode === 70) {
      this.multiplayer.moveRight(Player.Two);
    } else if (event.keyCode === 83) {
      this.multiplayer.moveLeft(Player.Two);
    } else if (event.keyCode === 68) {
      this.multiplayer.drop(Player.Two, false);
    } else if (event.keyCode === 65) {
      this.multiplayer.drop(Player.Two, false, true);
    }
  }
}

export default App;
