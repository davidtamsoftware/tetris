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
  "1": "orange orange darkorange orange",
  "2": "yellow #ebeb5e #afaf59 yellow",
  "3": "green lightgreen darkgreen green",
  "4": "blue lightblue darkblue blue",
  "5": "gray lightgray darkgray gray",
  "6": "red brown darkred red",
  "7": "purple #892289 #5a065a purple"
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
            height: "25px", 
            padding: "0",
            }}>
              {currBoard.state[i][j] ? 
              <div 
                style={{
                  // backgroundColor: currBoard.state[i][j] ? colors[currBoard.state[i][j]]: "initial",
                  border: "5px solid",
                  borderRadius: "2px",
                  // borderColor: "green lightgreen darkgreen green",
                  borderColor: colors[currBoard.state[i][j]],
                  backgroundColor: colors[currBoard.state[i][j]].split(" ")[0],
                  width: "calc(100% - 10px)",
                  height: "100%",
                  padding: "0",
                }}/> : null}
            </td>);
      }
      board.push(<tr key={i}>{row}</tr>)
    }

    return (
      <div className="App">
        <table style={{ borderRadius: "5px", border: "10px solid gray", borderSpacing: "0", margin: "auto"}}>
          <tbody>
          { board }
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
    if (!this.state.gameover) {
      const result = moveDown(this.state.game, this.state.position, this.state.piece);
      this.setState({
        game: result.state,
        position: result.position,
        piece: result.piece,
        gameover: result.gameover,
      });      
    }
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
