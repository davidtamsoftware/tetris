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
  stats?: Stats
  nextPiece?: Piece;
}

interface Stats {
  score: number;
  highscore: number;
  count?: { [pieceId: string]: number };
};

type GamePiece = Piece;

const colors = {
  "1": "orange #c88a19 darkorange orange",
  "2": "yellow #ebeb5e #afaf59 yellow",
  "3": "green lightgreen darkgreen green",
  "4": "blue lightblue darkblue blue",
  "5": "gray lightgray darkgray gray",
  "6": "red brown darkred red",
  "7": "purple #892289 #5a065a purple"
};

const initializeState = (): State => {
  const randomPiece = generateRandomPiece();
  return {
    game: [
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
          [0,0,0,0,0,0,0,0,0,0],
      ],
      ...randomPiece,
      gameover: false,
      stats: {
        count: pieces
          .map((item) => ({[item.toString()]: item === randomPiece.piece ? 1 : 0}))
          .reduce((acc, item) => ({ ...acc, ...item })),
        highscore: 1000,
        score: 1,
      }
  };
};

class App extends React.Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = initializeState();
    this.restart = this.restart.bind(this);
    this.tick = this.tick.bind(this);
    this.incrementCount = this.incrementCount.bind(this);
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public componentDidMount() {
    setInterval(this.tick, 1000);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public render() {
    const currBoard = merge(this.state.game, this.state.position, this.state.piece);
    const board = [];
    for (let i=0; i<currBoard.state.length; i++) {
      const row = [];
      for (let j=0; j<currBoard.state[i].length; j++) {
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
    for (let i=0; i<pieces.length; i++) {
      counts.push(
      <tr>
        <td>
          <table style={{borderSpacing: "0", margin: "auto"}}>
            <tbody>
              { this.generatePiece(pieces[i]) }
            </tbody>
          </table>
        </td>
        <td>
          {this.state.stats!.count![pieces[i].toString()]}
        </td>
      </tr>);
    }

    return (
      <div className="App">
        <table style={{ display: "inline-block", borderRadius: "5px", border: "10px solid gray", borderSpacing: "0", margin: "auto"}}>
          <tbody>
          { board }
          </tbody>
        </table>
        <table style={{ display: "inline-block", verticalAlign: "top", borderRadius: "5px", border: "10px solid gray", borderSpacing: "0", margin: "auto"}}>
          <tbody>
          <tr>
            <td>High Score: </td>
            <td>{this.state.stats!.highscore}</td>
          </tr>
          <tr>
            <td>Score: </td>
            <td>{this.state.stats!.score}</td>
          </tr>
          <tr>
            <td>Level: </td>
            <td>1</td>
          </tr>
          <tr>
            <td>Counts: </td>
            <td/>
          </tr>
          { counts }
          </tbody>
        </table>
        { this.state.gameover && 
          <div>game over! <button onClick={this.restart}>restart now</button></div> }
      </div>
    );
  }

  private generatePiece(piece: Piece) {
    const row = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i=0; i<piece.length; i++) {
      const col = [];
      // tslint:disable-next-line:prefer-for-of
      for (let j=0; j<piece[i].length; j++) {
        col.push(<td style={{padding: "0"}}>{piece[i][j] ? <Block data={piece[i][j]} size="small" />: null }</td>);
      }
      row.push(<tr>{col}</tr>);
    }
    return row;
  }

  private restart() {
    this.setState(initializeState());
  }

  private tick() {
    if (!this.state.gameover) {
      const result = moveDown(this.state.game, this.state.position, this.state.piece, this.incrementCount);

      this.setState({
        game: result.state,
        position: result.position,
        piece: result.piece,
        gameover: result.gameover,
      });      
    }
  }

  private incrementCount(pieceKey: string) {
      const count = {
        ...this.state.stats!.count
      };
      count[pieceKey] += 1;

      this.setState({
        stats: {            
          count,
          highscore: 1,
        } as any,
      });
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.state.gameover) {
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
      const result = moveDown(this.state.game, this.state.position, this.state.piece, this.incrementCount);

      this.setState({
        game: result.state,
        position: result.position,
        piece: result.piece,
        gameover: result.gameover,
      });
    }
  }
}

export default App;
