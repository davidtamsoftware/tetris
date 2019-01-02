import * as React from "react";
import { Functions, Models, Tetris } from "tetris-core";
import { Controls } from "../../components/Controls";
import Menu from "../../components/Menu";
import { NextPiece } from "../../components/NextPiece";
import { Playfield } from "../../components/Playfield";
import { Scoreboard } from "../../components/Scoreboard";
import { Stats } from "../../components/Stats";
import { gameOverMenu, Key, pauseMenu, Props } from "../App";
import styles from "./index.module.css";
import { Event } from "tetris-core/lib/actions/Tetris";

class App extends React.Component<Props, Models.Game> {

  private tetris: Tetris;
  private theme: HTMLAudioElement;

  constructor(props: Props) {
    super(props)
    this.tetris = new Tetris();
    this.state = this.tetris.getState();
    this.handle = this.handle.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.theme = new Audio("/tetris_theme.mp3");
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.tetris.subscribe(this.handle);
    this.tetris.subscribeToEvent(this.handleEvent);
    this.theme.loop = true;
    this.theme.play();
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.tetris.unsubscribeToEvent(this.handleEvent);
    this.theme.remove();
  }

  public componentDidMount() {
    this.tetris.start();
  }

  public render() {
    if (!this.state.playfield) {
      return null;
    }

    const result = Functions.merge(this.state.playfield, this.state.position, this.state.piece);

    if (this.state.gameState === Models.GameState.Paused) {
      this.theme.pause();
    } else if (this.state.gameState === Models.GameState.GameOver) {
      this.theme.pause();
    } else {
      this.theme.play();
    }
    return (
      <div className={styles.App}>
        <div className={styles.left}>
          <Controls />
          <NextPiece piece={this.state.nextPiece} />
        </div>
        <div className={styles.right}>
          <Scoreboard scoreboard={this.state.scoreboard} />
          <Stats stats={this.state.stats} />
        </div>
        <div className={styles.main}>
          <Playfield playfield={result.playfield} gameState={this.state.gameState} />
          {this.state.gameState === Models.GameState.Paused &&
            <div style={{ position: "absolute", 
            left: "calc(50% - 200px - 5px - 20px)",
            top: "200px", 
            backgroundColor: "black"}}>
              {/* <Paused /> */}
              <Menu menu={pauseMenu} notify={this.handleMenuSelect} menuClose={this.handleMenuClose} />
            </div>
          }
          {this.state.gameState === Models.GameState.GameOver &&
            <div style={{ position: "absolute", 
            left: "calc(50% - 200px - 5px - 20px)",
            top: "200px", 
            backgroundColor: "black"}}>
              {/* <GameOver /> */}
              <Menu menu={gameOverMenu} notify={this.handleMenuSelect} />
            </div>
          }
        </div>
      </div>
    );
  }

  private handleMenuClose = () => {
    this.tetris.togglePause();
    const audio = new Audio("/pause_out.mp3");
    audio.play();
  }

  private handleMenuSelect = (key: Key) => {
    if (key === "HOME" || key === "QUIT_CONFIRM") {
      this.tetris.endGame();
      this.props.exit();
    } else if (key === "QUIT_CANCEL") {
      return false;
    } else if (key === "RESUME") {
      this.tetris.togglePause();
      const audio = new Audio("/unpause.mp3");
      audio.play();
    } else if (key === "RESTART") {
      this.tetris.restart();
      this.theme.currentTime = 0
    }
    return true;
  }

  private handle(game: Models.Game) {
    if (game.gameState === Models.GameState.GameOver) {
      localStorage.setItem("highscore", game.scoreboard.highscore.toString());
    }
    this.setState(game);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.state.gameState === Models.GameState.GameOver && event.keyCode === 82) {
      this.tetris.restart();
    } else if (this.state.gameState === Models.GameState.Active && event.keyCode === 27) {
      this.tetris.togglePause();
      const audio = new Audio("/pause_in.mp3");
      audio.play();
    } else if (this.state.gameState !== Models.GameState.Active) {
      return;
    } else if (event.keyCode === 90) {
      this.tetris.rotateLeft();
      const audio = new Audio("/rotate_left.mp3");
      audio.play();
    } else if (event.keyCode === 38) {
      this.tetris.rotateRight();
      const audio = new Audio("/rotate_right.mp3");
      audio.play();
    } else if (event.keyCode === 39) {
      this.tetris.moveRight();
    } else if (event.keyCode === 37) {
      this.tetris.moveLeft();
    } else if (event.keyCode === 40) {
      this.tetris.drop(false);
    } else if (event.keyCode === 32) {
      this.tetris.drop(false, true);

    }
  }

  private handleEvent = (event: Event) => {
    if (event === Event.Drop) {
      const audio = new Audio("/drop.mp3");
      audio.play();
    } else if (event === Event.Single) {
      const audio = new Audio("/single.mp3");
      audio.play();
    } else if (event === Event.GameOver) {
      const audio = new Audio("/gameover.mp3");
      audio.play();
    }
  }
}

export default App;
