import * as React from "react";
import { Functions, Models, Tetris } from "tetris-core";
import { Controls } from "../../components/Controls";
import { GameOver } from "../../components/GameOver";
import Menu from "../../components/Menu";
import { NextPiece } from "../../components/NextPiece";
import { Paused } from "../../components/Paused";
import { Playfield } from "../../components/Playfield";
import { Scoreboard } from "../../components/Scoreboard";
import { Stats } from "../../components/Stats";
import { gameOverMenu, Key, pauseMenu, Props } from "../App";
import styles from "./index.module.css";

class App extends React.Component<Props, Models.Game> {

  private tetris: Tetris;

  constructor(props: Props) {
    super(props)
    this.tetris = new Tetris();
    this.state = this.tetris.getState();
    this.handle = this.handle.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.tetris.subscribe(this.handle);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.tetris.unsubscribe(this.handle);
  }

  public componentDidMount() {
    this.tetris.start();
  }

  public render() {
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

  private handle(game: Models.Game) {
    if (game.gameState === Models.GameState.GameOver) {
      localStorage.setItem("highscore", game.scoreboard.highscore.toString());
    }
    this.setState(game);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.state.gameState === Models.GameState.GameOver && event.keyCode === 82) {
      this.tetris.restart();
    } else if (this.state.gameState === Models.GameState.Active && (event.keyCode === 80 || event.keyCode === 27)) {
      this.tetris.togglePause();
    } else if (this.state.gameState !== Models.GameState.Active) {
      return;
    } else if (event.keyCode === 90) {
      this.tetris.rotateLeft();
    } else if (event.keyCode === 38) {
      this.tetris.rotateRight();
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
}

export default App;
