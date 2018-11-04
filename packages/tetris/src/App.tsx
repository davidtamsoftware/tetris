import * as React from 'react';
import './App.css';
import { GameState, Piece } from './models/pieces';
import { generateRandomPiece, merge, moveDown, moveLeft, moveRight, PositionGrid, rotateRight } from './models/stage';

interface State {
  game: GameState;
  position: PositionGrid;
  piece: Piece;
  gameover: boolean;
}

const colors = {
  "0": "red",
  "1": "orange",
  "2": "yellow",
  "3": "green",
  "4": "blue",
  "5": "gray",
  "6": "brown",
  "7": "purple"
};

const initState: State = {
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
    ...generateRandomPiece(),
    gameover: false,
};

class App extends React.Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = initState;
    this.restart = this.restart.bind(this);
    this.tick = this.tick.bind(this);
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public componentDidMount() {
    setTimeout(this.tick, 20);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
  }

  public render() {
    const currBoard = merge(this.state.game, this.state.position, this.state.piece);
    // tslint:disable-next-line:no-console
    // console.log(this.state.game);
    const board = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i=0; i<currBoard.state.length; i++) {
      const row = [];
      // tslint:disable-next-line:prefer-for-of
      for (let j=0; j<currBoard.state[i].length; j++) {
        row.push(<td key={j} style={{border: "0px dotted black", width: "25px", height: "25px", backgroundColor: currBoard.state[i][j] ? colors[currBoard.state[i][j]]: "initial"}}>
        {/* {currBoard.state[i][j]} */}
        </td>);
      }
      board.push(<tr key={i}>{row}</tr>)
    }

    return (
      <div className="App">
      <table style={{border: "1px solid black", borderSpacing: "0"}}>
        <tbody>
        { 
          board
        }
        </tbody>
        </table>
        { this.state.gameover && 
          <div>game over! <button onClick={this.restart}>restart now</button></div> }
      </div>
    );
  }

  private restart() {
    this.setState(initState);
  }

  private tick() {
    const result = moveDown(this.state.game, this.state.position, this.state.piece);
    this.setState({
      game: result.state,
      position: result.position,
      piece: result.piece,
      gameover: result.gameover,
    });

    setTimeout(this.tick, 1000);
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
      const result = moveDown(this.state.game, this.state.position, this.state.piece);
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
