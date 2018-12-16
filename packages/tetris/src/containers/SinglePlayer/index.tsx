import * as React from "react";
import { Functions, Models, Tetris } from "tetris-core";
import { Controls } from "../../components/Controls";
import { GameOver } from "../../components/GameOver";
import { NextPiece } from "../../components/NextPiece";
import { Paused } from "../../components/Paused";
import { Playfield } from "../../components/Playfield";
import { Scoreboard } from "../../components/Scoreboard";
import { Stats } from "../../components/Stats";
import "./index.css";

class App extends React.Component<{}, Models.Game> {

  private tetris: Tetris;
  
  constructor(props: {}) {
    super(props)
    this.tetris = new Tetris();
    this.state = this.tetris.getState();
    this.handle = this.handle.bind(this);
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.tetris.subscribe(this.handle);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.tetris.unsubscribe(this.handle);
  }

  public componentDidMount() {
    this.tetris.start();
  }

  public render() {
    const result = Functions.merge(this.state.playfield, this.state.position, this.state.piece);

    return (
      <div className="App">
        <div className="left">
          <Controls />
          <NextPiece piece={this.state.nextPiece} />
        </div>
        <div className="right">
         <Scoreboard scoreboard={this.state.scoreboard} />
         <Stats stats={this.state.stats} />
        </div>
        <div className="main">
          <Playfield playfield={result.playfield} gameState={this.state.gameState} />
          {this.state.gameState === Models.GameState.Paused && <Paused /> }
          {this.state.gameState === Models.GameState.GameOver && <GameOver />}
        </div>
      </div>
    );
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
    } else if (this.state.gameState !== Models.GameState.GameOver && event.keyCode === 80) {
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
