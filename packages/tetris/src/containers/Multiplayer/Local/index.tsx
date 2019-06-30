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
    this.multiplayer.unsubscribeToEvent(handleEvent);
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
      this.multiplayer.player1Actions.rotateLeft();
    } else if (event.code === "ArrowUp") {
      this.multiplayer.player1Actions.rotateRight();
    } else if (event.code === "ArrowRight") {
      this.multiplayer.player1Actions.moveRight();
    } else if (event.code === "ArrowLeft") {
      this.multiplayer.player1Actions.moveLeft();
    } else if (event.code === "ArrowDown") {
      this.multiplayer.player1Actions.drop();
    } else if (event.code === "Space") {
      this.multiplayer.player1Actions.drop(true);
    } else if (event.code === "KeyE") {
      this.multiplayer.player2Actions.rotateLeft();
    } else if (event.code === "KeyR") {
      this.multiplayer.player2Actions.rotateRight();
    } else if (event.code === "KeyF") {
      this.multiplayer.player2Actions.moveRight();
    } else if (event.code === "KeyS") {
      this.multiplayer.player2Actions.moveLeft();
    } else if (event.code === "KeyD") {
      this.multiplayer.player2Actions.drop();
    } else if (event.code === "KeyA") {
      this.multiplayer.player2Actions.drop(true);
    }
  }
}

export default App;
