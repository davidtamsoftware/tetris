import * as React from 'react';
import './App.css';
import { Block } from "./Block";
import { PlayField, Piece, pieces } from './models';
import { generateRandomPiece, merge, moveDown, moveLeft, moveRight, PiecePosition, rotateRight, hasCollision } from './actions/stage';

interface State {
  playField: PlayField;
  position: PiecePosition;
  piece: Piece;
  gameover: boolean;
  paused?: boolean;
  stats: Stats
  score: number;
  highscore: number;
  level: number;
  lines: number;
  nextPiece?: Piece;
}

interface Stats {
  [pieceId: string]: number;
};

type GamePiece = Piece;

const initializeState = (): State => {
  const randomPiece = generateRandomPiece();
  return {
    playField: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    ...randomPiece,
    gameover: false,
    level: 1,
    lines: 0,
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
          {result.playField[i][j] ? <Block data={result.playField[i][j]} /> : null}
        </td>);
      }
      board.push(<tr key={i}>{row}</tr>)
    }

    const counts = [];

    for (const piece of pieces) {
      counts.push(
        <tr>
          <td>
            <table style={{ borderSpacing: "0", margin: "auto" }}>
              <tbody>
                {this.generatePiece(piece)}
              </tbody>
            </table>
          </td>
          <td>
            {this.state.stats[piece.toString()]}
          </td>
        </tr>);
    }

    return (
      <div className="App">
        <table style={{ float: "left", borderRadius: "0px", border: "5px solid white", borderSpacing: "0", margin: "auto" }}>
          <tbody>
            <tr>
              <td>Rotate: </td>
              <td>Spacebar</td>
            </tr>
            <tr>
              <td>Move Left: </td>
              <td>&larr;</td>
            </tr>
            <tr>
              <td>Move Right: </td>
              <td>&rarr;</td>
            </tr>
            <tr>
              <td>Move Down: </td>
              <td>&darr;</td>
            </tr>
            <tr>
              <td>Pause/Resume: </td>
              <td>P</td>
            </tr>
          </tbody>
        </table>
        <table style={{ float: "right", verticalAlign: "top", borderRadius: "0px", border: "5px solid white", borderSpacing: "0", margin: "auto" }}>
          <tbody>
            <tr>
              <td>High Score: </td>
              <td>{this.state.highscore}</td>
            </tr>
            <tr>
              <td>Score: </td>
              <td>{this.state.score}</td>
            </tr>
            <tr>
              <td>Lines: </td>
              <td>{this.state.lines}</td>
            </tr>
            <tr>
              <td>Level: </td>
              <td>{this.state.level}</td>
            </tr>
            <tr>
              <td>Counts: </td>
              <td />
            </tr>
            {counts}
          </tbody>
        </table>
        <table style={{ float: "right", borderRadius: "0px", border: "3px solid white", borderSpacing: "0", margin: "auto" }}>
          <tbody>
            {board}
          </tbody>
        </table>
        {this.state.gameover &&
          <div>game over! <button onClick={this.restart}>restart now</button></div>}
        {this.state.paused && <div>Paused</div>}
      </div>
    );
  }

  private levelUp() {
    clearInterval(this.loop);
    // check state, and set timeout based on level
    this.loop = setInterval(this.ticker, this.refreshInterval);
  }

  private generatePiece(piece: Piece) {
    return piece.map((r) => (
      <tr>
        {r.map((c) => (<td style={{ padding: "0" }}>{c ? <Block data={c} size="small" /> : null}</td>))}
      </tr>
    ));
  }

  private restart() {
    this.setState(initializeState());
  }

  private async ticker() {
    if (!this.state.gameover && !this.state.paused && !this.freezeSemaphore) {
      this.freezeSemaphore = true;
      const result = await moveDown(
        this.state.playField,
        this.state.position,
        this.state.piece,
        this.incrementCount,
        this.addScore,
        this.addLines,
        this.updateGame);

      this.freezeSemaphore = false;
      this.setState({
        playField: result.playField,
        position: result.position,
        piece: result.piece,
        gameover: result.gameover,
      });
    }
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
      piece: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    })
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (!this.state.gameover && event.keyCode === 80) {
      this.setState({
        paused: !this.state.paused,
      });
    }

    if (this.state.gameover || this.state.paused) {
      return;
    }

    if (event.keyCode === 32) {
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
      this.ticker();
    }
  }
}

export default App;
