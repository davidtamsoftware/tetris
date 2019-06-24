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
    if (this.state.gameState === Models.GameState.Active && event.code === "Escape") {
      this.multiplayer.togglePause();
    } else if (this.state.gameState !== Models.GameState.Active) {
      return;
    } else if (event.code === "ShiftRight") {
      this.multiplayer.rotateLeft(MultiplayerAction.Player.One);
    } else if (event.code === "ArrowUp") {
      this.multiplayer.rotateRight(MultiplayerAction.Player.One);
    } else if (event.code === "ArrowRight") {
      this.multiplayer.moveRight(MultiplayerAction.Player.One);
    } else if (event.code === "ArrowLeft") {
      this.multiplayer.moveLeft(MultiplayerAction.Player.One);
    } else if (event.code === "ArrowDown") {
      this.multiplayer.drop(MultiplayerAction.Player.One);
    } else if (event.code === "Space") {
      this.multiplayer.drop(MultiplayerAction.Player.One, true);
    } else if (event.code === "KeyE") {
      this.multiplayer.rotateLeft(MultiplayerAction.Player.Two);
    } else if (event.code === "KeyR") {
      this.multiplayer.rotateRight(MultiplayerAction.Player.Two);
    } else if (event.code === "KeyF") {
      this.multiplayer.moveRight(MultiplayerAction.Player.Two);
    } else if (event.code === "KeyS") {
      this.multiplayer.moveLeft(MultiplayerAction.Player.Two);
    } else if (event.code === "KeyD") {
      this.multiplayer.drop(MultiplayerAction.Player.Two);
    } else if (event.code === "KeyA") {
      this.multiplayer.drop(MultiplayerAction.Player.Two, true);
    }
  }
}

export default App;
