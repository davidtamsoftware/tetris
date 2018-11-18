import * as React from "react";
import "./index.css";
import { Playfield } from "../Playfield";
import { Piece } from "../Piece";
import { Controls } from "../Controls";
import { Game, GameState } from "../../models";
import { merge } from "../../actions";
import { Scoreboard } from "../Scoreboard";
import { Stats } from "../Stats";
import { Paused } from "../Paused/Paused";
import { GameOver } from "../GameOver";
import { Tetris } from "src/actions/Tetris";

class App extends React.Component<{}, Game> {

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
    const result = merge(this.state.playfield, this.state.position, this.state.piece);

    return (
      <div className="App">
        <div className="left">
          <Controls />
          <div>
            <h2>Next</h2>
            <Piece piece={this.state.nextPiece} size={"large"} />
          </div>
        </div>
        <div className="right">
         <Scoreboard scoreboard={this.state.scoreboard} />
         <Stats stats={this.state.stats} />
        </div>
        <div>
          <Playfield playfield={result.playfield} gameState={this.state.gameState} />
          {this.state.gameState === GameState.Paused && <Paused /> }
          {this.state.gameState === GameState.GameOver && <GameOver />}
        </div>
      </div>
    );
  }

  private handle(game: Game) {
    if (this.state.gameState === GameState.GameOver) {
      localStorage.setItem("highscore", game.scoreboard.highscore.toString());
    }
    this.setState(game);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.state.gameState === GameState.GameOver && event.keyCode === 82) {
      this.tetris.restart();
    } else if (this.state.gameState !== GameState.GameOver && event.keyCode === 80) {
      this.tetris.togglePause();
    } else if (this.state.gameState !== GameState.Active) {
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
