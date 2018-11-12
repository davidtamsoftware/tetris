import * as React from 'react';
import './index.css';
import { Block } from "../Block";
import { PlayField, playField as initialPlayField, Piece, pieces, PiecePosition, Fill } from '../../models';
import { generateRandomPiece, merge, moveDown, moveLeft, moveRight, rotateRight, hasCollision, rotateLeft } from '../../actions';

enum GameState {
  Paused,
  Active,
  GameOver,
};

interface State {
  playField: PlayField;
  position: PiecePosition;
  piece: Piece;
  gameState: GameState;
  stats: Stats
  score: number;
  highscore: number;
  level: number;
  lines: number;
  nextPiece: Piece;
}

interface Stats {
  [pieceId: string]: number;
};

type GamePiece = Piece;

const initializeState = (): State => {
  const randomPiece = generateRandomPiece();
  return {
    playField: initialPlayField,
    ...randomPiece,
    gameState: GameState.Active,
    level: 1,
    lines: 0,
    nextPiece: generateRandomPiece().piece,
    highscore: 1000,
    score: 1,
    stats: pieces
      .map((item) => ({ [item.toString()]: item === randomPiece.piece ? 1 : 0 }))
      .reduce((acc, item) => ({ ...acc, ...item })),
  };
};

class App extends React.Component<{}, State> {

  private loop: NodeJS.Timeout;
  private freezeSemaphore: boolean;
  private refreshInterval: number;

  constructor(props: {}) {
    super(props)
    this.refreshInterval = 1000;
    this.state = initializeState();
    this.restart = this.restart.bind(this);
    this.ticker = this.ticker.bind(this);
    this.incrementCount = this.incrementCount.bind(this);
    this.addLines = this.addLines.bind(this);
    this.addScore = this.addScore.bind(this);
    this.updateGame = this.updateGame.bind(this);
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public componentDidMount() {
    this.levelUp();
  }

  public render() {
    const result = merge(this.state.playField, this.state.position, this.state.piece);
    const board = [];
    for (let i = 0; i < result.playField.length; i++) {
      const row = [];
      for (let j = 0; j < result.playField[i].length; j++) {
        row.push(<td key={j}
          style={{
            border: "1px solid black",
            backgroundColor: "black",
            width: "25px",
            height: "26px",
            padding: "0",
          }}>
          <Block data={result.playField[i][j]} />
        </td>);
      }
      board.push(<tr key={i}>{row}</tr>)
    }

    const counts = [];

    for (const piece of pieces) {
      counts.push(
        <tr>
          <td>
            {this.generatePiece(piece, "small")}
          </td>
          <td>
            {this.state.stats[piece.toString()]}
          </td>
        </tr>);
    }

    return (
      <div className="App">
        <div style={{ width: "250px", height: "250px", float: "left", borderRadius: "0px", border: "0px solid white", borderSpacing: "0", margin: "auto" }}>
          <table style={{ tableLayout: "fixed", border: "0px solid white", width: "100%", borderSpacing: "0 10px" }}>
            <tbody>
              <tr>
                <td><h2>Controls</h2></td>
                <td/>
              </tr>
              <tr>
                <td>Rotate Left</td>
                <td>Z</td>
              </tr>
              <tr>
                <td>Rotate Right</td>
                <td>&uarr;</td>
              </tr>
              <tr>
                <td>Move Left</td>
                <td>&larr;</td>
              </tr>
              <tr>
                <td>Move Right</td>
                <td>&rarr;</td>
              </tr>
              <tr>
                <td>Soft Drop</td>
                <td>&darr;</td>
              </tr>
              <tr>
                <td>Hard Drop</td>
                <td>Spacebar</td>
              </tr>
              <tr>
                <td>Pause/Resume</td>
                <td>P</td>
              </tr>
              <tr>
                <td><br/><br/></td>
                <td/>
              </tr>
              <tr>
                <td><h2>Next</h2></td>
                <td/>
              </tr>
              <tr>
                <td>{this.generatePiece(this.state.nextPiece, "large")}</td>
                <td/>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{
          float: "right",
          verticalAlign: "top",
          borderRadius: "0px",
          border: "0px solid white",
          borderSpacing: "0",
          margin: "auto",
          width: "250px",
          height: "250px"
        }}>
          <table style={{ tableLayout: "fixed", border: "0px solid white", width: "100%", borderSpacing: "0 10px" }}>
            <tbody>
              <tr>
                <td><h2>Scoreboard</h2></td>
                <td/>
              </tr>
              <tr>
                <td>High Score</td>
                <td>{this.state.highscore}</td>
              </tr>
              <tr>
                <td>Score</td>
                <td>{this.state.score}</td>
              </tr>
              <tr>
                <td>Lines</td>
                <td>{this.state.lines}</td>
              </tr>
              <tr>
                <td>Level</td>
                <td>{this.state.level}</td>
              </tr>
              <tr>
                <td><br /></td>
                <td />
              </tr>
              <tr>
                <td><br /></td>
                <td />
              </tr>
              <tr>
                <td><h2>Stats</h2></td>
                <td/>
              </tr>
              {counts}
            </tbody>
          </table>
        </div>
        <table style={{
          filter: `grayscale(${this.state.gameState === GameState.Paused ? "80" : "0"}%)`,
          borderRadius: "0px",
          border: "3px solid white",
          borderSpacing: "0",
          margin: "auto"
        }}>
          <tbody>
            {this.state.gameState === GameState.Paused && <div style={{ position: "absolute", left: "38%", top: "42%", backgroundColor: "black" }}>Paused</div>}
            {this.state.gameState === GameState.GameOver &&
              <div style={{ width: "180px", position: "absolute", left: "20%", top: "40%", backgroundColor: "black" }}>Game Over!<br/>Press the R to restart</div>}
            {board}
          </tbody>
        </table>
      </div>
    );
  }

  private levelUp() {
    clearInterval(this.loop);

    this.loop = setInterval(this.ticker, 1000);
  }

  private generatePiece(piece: Piece, size: "small" | "large") {
    return (<table style={{borderSpacing: "0", margin: "auto" }}>
      <tbody>
        {piece.map((r) => (
          <tr>
            {r.map((c) => (<td style={{ border: `${size==="small"?"0":"1"}px solid #131010`, padding: "0" }}>{c ? <Block data={c} size={size} /> : null}</td>))}
          </tr>
        ))}
      </tbody>
    </table>)
  }

  private restart() {
    this.setState(initializeState());
  }

  private async drop(hardDrop?: boolean) {
    if (this.state.gameState === GameState.Active && !this.freezeSemaphore) {
      this.freezeSemaphore = true;
      const result = await moveDown(
        this.state.playField,
        this.state.position,
        this.state.piece,
        // this.incrementCount,
        this.addScore,
        this.addLines,
        this.updateGame,
        hardDrop);

      this.freezeSemaphore = false;

      let nextPiece;
      if (!result.piece) {
        const newPos = {
          row: -1,
          col: 3,
        };

        result.piece = this.state.nextPiece;
        result.position = newPos;
        nextPiece = generateRandomPiece().piece;
        this.incrementCount(result.piece.toString());

        // check if new piece has collision with new playField, if so then game over
        if (hasCollision(result.playField, newPos, result.piece)) {
          result.gameover = GameState.GameOver;
        }
      }

      this.setState({
        ...result,
        nextPiece: nextPiece ? nextPiece : this.state.nextPiece,
        gameState: result.gameover ? GameState.GameOver : GameState.Active,
      });
    }
  }

  private async ticker() {
    this.drop();
  }

  private incrementCount(pieceKey: string) {
    const stats = {
      ...this.state.stats
    };
    stats[pieceKey] += 1;

    this.setState({
      stats: {
        ...stats,
      } as any,
    });
  }

  private addScore(score: number) {
    this.setState({
      lines: this.state.lines + score
    });
  }

  private addLines(lines: number) {
    this.setState({
      lines: this.state.lines + lines
    });
  }

  private updateGame(playField: PlayField) {
    this.setState({
      playField,
      piece: new Array<Fill[]>(4).fill(new Array<Fill>(4).fill(Fill.Blank)) as Piece,
    })
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.state.gameState === GameState.GameOver && event.keyCode === 82) {
      this.restart();
    }

    if (this.state.gameState !== GameState.GameOver && event.keyCode === 80) {
      this.setState({
        gameState: this.state.gameState === GameState.Paused ? GameState.Active : GameState.Paused,
      });
    }

    if (this.state.gameState !== GameState.Active) {
      return;
    }

    if (event.keyCode === 90) {
      const { position, piece } = rotateLeft(this.state.playField, this.state.position, this.state.piece);
      this.setState({
        position,
        piece,
      });
    } else if (event.keyCode === 38) {
      const { position, piece } = rotateRight(this.state.playField, this.state.position, this.state.piece);
      this.setState({
        position,
        piece,
      });
    } else if (event.keyCode === 39) {
      const result = moveRight(this.state.playField, this.state.position, this.state.piece);
      this.setState({
        position: result.position,
        piece: result.piece,
      });
    } else if (event.keyCode === 37) {
      const result = moveLeft(this.state.playField, this.state.position, this.state.piece);
      this.setState({
        position: result.position,
        piece: result.piece,
      });
    } else if (event.keyCode === 40) {
      this.drop();
    } else if (event.keyCode === 32) {
      this.drop(true);
    }
  }
}

export default App;
