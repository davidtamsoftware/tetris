import * as React from "react";
import { Models, Multiplayer as MultiplayerAction } from "tetris-core";
import { MultiplayerMode } from "tetris-core/lib/actions/Multiplayer";
import { Multiplayer } from "..";
import Menu from "../../../components/Menu";
import { gameOverMenu, handleEvent, Key, pauseMenu, Props } from "../../App";

class App extends React.Component<Props & { mode: MultiplayerMode }, MultiplayerAction.MultiplayerState> {

  private multiplayer: MultiplayerAction.Multiplayer;

  constructor(props: Props & { mode: MultiplayerMode }) {
    super(props)
    this.multiplayer = new MultiplayerAction.Multiplayer(props.mode);
    this.state = this.multiplayer.getState();
  }

  public componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.multiplayer.subscribe(this.handle);
    this.multiplayer.subscribeToEvent(handleEvent);
    this.multiplayer.start();
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.multiplayer.unsubscribe(this.handle);
    this.multiplayer.subscribeToEvent(handleEvent);
  }

  public render() {
    return <Multiplayer
      {...this.state}
      mode={this.props.mode}
      pauseMenu={<Menu menu={pauseMenu} notify={this.handleMenuSelect} menuClose={this.handleMenuClose} />}
      gameOverMenu={<Menu menu={gameOverMenu} notify={this.handleMenuSelect} />}
    />;
  }

  private handleMenuClose = () => {
    this.multiplayer.togglePause();
  }

  private handleMenuSelect = (key: Key) => {
    if (key === "HOME" || key === "QUIT_CONFIRM") {
      this.multiplayer.endGame();
      this.props.exit();
    } else if (key === "QUIT_CANCEL") {
      return false;
    } else if (key === "RESUME") {
      this.multiplayer.togglePause();
    } else if (key === "RESTART") {
      this.multiplayer.restart();
    }
    return true;
  }

  private handle = (multiplayerState: MultiplayerAction.MultiplayerState) => {
    this.setState({
      ...multiplayerState,
    });
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.state.gameState === Models.GameState.GameOver && event.keyCode === 82) {
      this.multiplayer.restart();
    } else if (this.state.gameState === Models.GameState.Active && event.keyCode === 27) {
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
