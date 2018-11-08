import * as React from 'react';
import './App.css';
import { Block } from "./Block";
import { GameState, Piece, pieces } from './models/pieces';
import { generateRandomPiece, merge, moveDown, moveLeft, moveRight, PositionGrid, rotateRight, hasCollision } from './models/stage';

interface State {
  game: GameState;
  position: PositionGrid;
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
    game: [
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
  private freeze: boolean;

  constructor(props: {}) {
    super(props)
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


  public componentDidMount() {
    this.levelUp();
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public render() {
    const currBoard = merge(this.state.game, this.state.position, this.state.piece);
    const board = [];
    for (let i = 0; i < currBoard.state.length; i++) {
      const row = [];
      for (let j = 0; j < currBoard.state[i].length; j++) {
        row.push(<td key={j}
          style={{
            border: "1px solid black",
            backgroundColor: "black",
            width: "25px",
            height: "26px",
            padding: "0",
          }}>
          {currBoard.state[i][j] ? <Block data={currBoard.state[i][j]} /> : null}
        </td>);
      }
      board.push(<tr key={i}>{row}</tr>)
    }

    const counts = [];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < pieces.length; i++) {
      counts.push(
        <tr>
          <td>
            <table style={{ borderSpacing: "0", margin: "auto" }}>
              <tbody>
                {this.generatePiece(pieces[i])}
              </tbody>
            </table>
          </td>
          <td>
            {this.state.stats[pieces[i].toString()]}
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
    this.loop = setInterval(this.ticker, 1000);
  }

  private generatePiece(piece: Piece) {
    const row = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < piece.length; i++) {
      const col = [];
      // tslint:disable-next-line:prefer-for-of
      for (let j = 0; j < piece[i].length; j++) {
        col.push(<td style={{ padding: "0" }}>{piece[i][j] ? <Block data={piece[i][j]} size="small" /> : null}</td>);
      }
      row.push(<tr>{col}</tr>);
    }
    return row;
  }

  private restart() {
    this.setState(initializeState());
  }


  private async ticker() {
    if (!this.state.gameover && !this.state.paused && !this.freeze) {
      this.freeze = true;
      const result = await moveDown(
        this.state.game,
        this.state.position,
        this.state.piece,
        this.incrementCount,
        this.addScore,
        this.addLines,
        this.updateGame);

      this.freeze = false;
      this.setState({
        game: result.state,
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
    // tslint:disable-next-line:no-console
    console.log(lines);
    this.setState({
      lines: this.state.lines + lines
    });
  }

  private updateGame(game: GameState) {
    this.setState({
      game,
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

    // tslint:disable-next-line:no-console
    // console.log("event fired " + event.keyCode);
    if (event.keyCode === 32) {
      const { position, piece } = rotateRight(this.state.game, this.state.position, this.state.piece);
      this.setState({
        position,
        piece,
      });
    } else if (event.keyCode === 39) {
      const result = moveRight(this.state.game, this.state.position, this.state.piece);
      this.setState({
        position: result.position,
        piece: result.piece,
      });
    } else if (event.keyCode === 37) {
      const result = moveLeft(this.state.game, this.state.position, this.state.piece);
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
