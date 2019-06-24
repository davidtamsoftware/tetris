import * as React from "react";
import { Functions, Models, Tetris } from "tetris-core";
import { HighScoreService } from "tetris-core/lib/actions/Tetris";
import { Controls } from "../../components/Controls";
import Menu from "../../components/Menu";
import { NextPiece } from "../../components/NextPiece";
import { Playfield } from "../../components/Playfield";
import { Scoreboard } from "../../components/Scoreboard";
import { Stats } from "../../components/Stats";
import { gameOverMenu, handleEvent, Key, pauseMenu, Props } from "../App";
import styles from "./index.module.css";

const localStorageHighScoreService: HighScoreService = {
  getHighScore() {
    return Number(localStorage.getItem("highscore") || 0);
  },
  saveHighScore(score: number) {
    localStorage.setItem("highscore", score.toString());
  }
}

class SinglePlayer extends React.Component<Props, Models.Game> {

  private tetris: Tetris;

  constructor(props: Props) {
    super(props)
    this.tetris = new Tetris(undefined, localStorageHighScoreService);
    this.state = this.tetris.getState();
  }

  public componentDidMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.tetris.subscribe(this.handle);
    this.tetris.subscribeToEvent(handleEvent);
    this.tetris.start();
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.tetris.unsubscribe(this.handle);
    this.tetris.unsubscribeToEvent(handleEvent);
  }

  public render() {
    if (!this.state.playfield) {
      return null;
    }

    const result = Functions.merge(this.state.playfield, this.state.position, this.state.piece);

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
            <div style={{
              position: "absolute",
              left: "calc(50% - 200px - 5px - 20px)",
              top: "200px",
              backgroundColor: "black"
            }}>
              <Menu menu={pauseMenu} notify={this.handleMenuSelect} menuClose={this.handleMenuClose} />
            </div>
          }
          {this.state.gameState === Models.GameState.GameOver &&
            <div style={{
              position: "absolute",
              left: "calc(50% - 200px - 5px - 20px)",
              top: "200px",
              backgroundColor: "black"
            }}>
              <Menu menu={gameOverMenu} notify={this.handleMenuSelect} />
            </div>
          }
        </div>
      </div>
    );
  }

  private handleMenuClose = () => {
    this.tetris.togglePause();
  }

  private handleMenuSelect = (key: Key) => {
    if (key === "HOME" || key === "QUIT_CONFIRM") {
      this.tetris.endGame();
      this.props.exit();
    } else if (key === "QUIT_CANCEL") {
      return false;
    } else if (key === "RESUME") {
      this.tetris.togglePause();
    } else if (key === "RESTART") {
      this.tetris.restart();
    }
    return true;
  }

  private handle = (game: Models.Game) => {
    this.setState(game);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.state.gameState === Models.GameState.Active && event.code === "Escape") {
      this.tetris.togglePause();
    } else if (this.state.gameState !== Models.GameState.Active) {
      return;
    } else if (event.code === "ShiftRight") {
      this.tetris.rotateLeft();
    } else if (event.code === "ArrowUp") {
      this.tetris.rotateRight();
    } else if (event.code === "ArrowRight") {
      this.tetris.moveRight();
    } else if (event.code === "ArrowLeft") {
      this.tetris.moveLeft();
    } else if (event.code === "ArrowDown") {
      this.tetris.drop();
    } else if (event.code === "Space") {
      this.tetris.drop(true);
    }
  }
}

export default SinglePlayer;
