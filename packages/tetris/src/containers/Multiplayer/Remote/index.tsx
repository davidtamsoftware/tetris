import * as React from "react";
import { Models, Multiplayer as MultiplayerAction } from "tetris-core";
import { Player } from "tetris-core/lib/actions/Multiplayer";
import { GameState } from "tetris-core/lib/models";
import { MatchEvent, MatchState } from "tetris-ws-model";
import { Multiplayer } from "..";
import Menu from "../../../components/Menu";
import { gameOverMenu, gameOverNoRestartMenu, handleEvent, Key, matchMenu, pauseMenu, Props } from "../../App";
import styles from "./index.module.css";
import { MultiplayerRemoteClient } from "./RemoteClient";

class App extends React.Component<Props, MultiplayerAction.MultiplayerState &
{
  matchId?: string;
  matchMenu?: boolean;
  matchEvent?: MatchEvent;
  playerCount: number;
  player?: Player;
  matchMessages: string[];
}> {

  private multiplayer: MultiplayerRemoteClient;
  private matchIdInput: HTMLInputElement | null;

  constructor(props: Props) {
    super(props);
    this.multiplayer = new MultiplayerRemoteClient(process.env.REACT_APP_TETRIS_SERVER_URL as any);
    this.state = {
      ...this.multiplayer.getState(),
      playerCount: 0,
      matchMessages: [],
    };
    this.matchIdInput = null;
  }

  public componentDidMount() {
    this.matchIdInput!.focus();
    document.addEventListener("keydown", this.handleKeyDown);
    this.multiplayer.subscribe(this.handle);
    this.multiplayer.subscribeToEvent(handleEvent);
    this.multiplayer.subscribeToMatchEvent(this.handleMatchEvent);
    this.multiplayer.subscribeToMatchState(this.handleMatchState);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.multiplayer.unsubscribe(this.handle);
    this.multiplayer.unsubscribeToEvent(handleEvent);
    this.multiplayer.unsubscribeToMatchEvent(this.handleMatchEvent);
    this.multiplayer.unsubscribeToMatchState(this.handleMatchState);
    if (this.state.matchId !== undefined) {
      this.multiplayer.disconnect();
    }
  }

  public render() {
    if (!this.state.matchId) {
      return <div className={styles.matchmaking}>
        {!this.state.matchMenu &&
          <div>
            <div>Enter new/existing match id:</div>
            <form onSubmit={this.submitMatchId}>
              <div>
                <input maxLength={10}
                  className={styles.matchId} required autoFocus
                  ref={(input) => { this.matchIdInput = input; }} type={"text"} /></div>
              <div><button>Submit</button></div>
            </form>
            <div style={{ padding: "60px 0" }}>-- OR --</div>
            <div>Select match from list:</div>
            <div>
              {/* <table style={{border: "1px solid white"}}>
            <thead>
              <th>
                <td>Match ID</td>
                <td>Players</td>
              </th>
            </thead>
            <tbody>
              <tr>
                <td>A1</td>
                <td>1/2</td>
              </tr>
            </tbody>
          </table> */}
              TBD
          </div>
          </div>}
        {this.state.matchMenu &&
          <Menu menu={matchMenu} notify={this.handleMatchMenuSelect} menuClose={this.handleMatchMenuClose} />
        }
      </div>;
    } else if (!this.state.player1 || !this.state.player2) {
      return <div>
        {`${this.state.playerCount}/2`} <br />
        {this.state.matchEvent === MatchEvent.DISCONNECTED && "Disconnected from server"}
        {this.state.matchEvent === MatchEvent.MATCH_FULL && `Game with match id ${this.state.matchId} is full`}
        {this.state.matchEvent === undefined && "Waiting for challenger to join..."}
        {this.state.matchMessages.map((msg, index) => <div key={index}>{msg}</div>)}
        {this.state.matchMenu &&
          <Menu menu={matchMenu} notify={this.handleMatchMenuSelect} menuClose={this.handleMatchMenuClose} />
        }
      </div>;
    }
    else {
      const gameOverMenuElement = <Menu menu={gameOverMenu} notify={this.handleMenuSelect} />;
      const gameOverNoRestartMenuElement = <Menu menu={gameOverNoRestartMenu} notify={this.handleMenuSelect} />;
      let menu = gameOverMenuElement;
      if (this.state.playerCount < 2 || this.state.matchEvent === MatchEvent.DISCONNECTED) {
        menu = gameOverNoRestartMenuElement;
      }
      return <>
        {`${this.state.playerCount}/2`} <br />
        {this.state.matchEvent === MatchEvent.DISCONNECTED && "Disconnected from server"}
        {this.state.matchMessages.map((msg, index) => <div key={index}>{msg}</div>)}
        <Multiplayer
          {...this.state}
          pauseMenu={<Menu menu={pauseMenu} notify={this.handleMenuSelect} menuClose={this.handlePauseMenuClose} />}
          gameOverMenu={menu}
          customGameWinner={<div>You {this.state.winner === this.state.player ? "win" : "lose"}</div>}
        />
      </>;
    }
  }

  private submitMatchId = (event: any) => {
    event.preventDefault();
    const matchId = this.matchIdInput!.value;
    if (matchId) {
      this.setState({ matchId }, () => {
        this.multiplayer.join(matchId);
      });
    }
  }

  private handleMatchMenuSelect = (key: Key) => {
    if (key === "QUIT_CONFIRM") {
      this.props.exit();
    } else if (key === "QUIT_CANCEL") {
      return false;
    }
    return true;
  }

  private handleMatchMenuClose = () => {
    this.setState({
      matchMenu: false,
    })
  }

  private handlePauseMenuClose = () => {
    this.multiplayer.togglePause();
  }

  private handleMenuSelect = (key: Key) => {
    if (key === "HOME" || key === "QUIT_CONFIRM") {
      this.multiplayer.endGame();
      this.props.exit();
    } else if (key === "QUIT_CANCEL") {
      return false;
    } else if (key === "RESUME") {
      this.multiplayer.togglePause();
    } else if (key === "RESTART") {
      this.multiplayer.restart();
    }
    return true;
  }

  private handle = (multiplayerState: MultiplayerAction.MultiplayerState) => {
    this.setState({
      ...multiplayerState,
    });
  }

  private handleMatchEvent = (matchEvent: MatchEvent) => {
    this.setState({
      matchEvent,
      gameState: this.state.gameState && matchEvent === MatchEvent.DISCONNECTED ? GameState.GameOver : this.state.gameState,
    });
  }

  private handleMatchState = (matchState: MatchState) => {
    // if 2 => 1, player left game
    // if 1 => 2 && gameState === undefined, player has joined the game, starting game
    // if 0 => 2, starting game

    const newMsg: string[] = [];
    if (this.state.playerCount === 2 && matchState.playerCount === 1) {
      newMsg.push("Player has left the game");
    } else if (this.state.playerCount === 1 && matchState.playerCount === 2 && this.state.gameState === undefined) {
      newMsg.push("Player has joined the game");
      newMsg.push("Starting game...");
    } else if (this.state.playerCount === 1 && matchState.playerCount === 2) {
      newMsg.push("Player has joined the game");
    } else if (this.state.playerCount === 0 && matchState.playerCount === 2 && this.state.gameState === undefined) {
      newMsg.push("Starting game...");
    }
    const matchMessages = [...this.state.matchMessages, ...newMsg];

    setTimeout(() => {
      const clonedMessages = [...this.state.matchMessages];
      newMsg.forEach(() => clonedMessages.shift());
      this.setState({
        matchMessages: clonedMessages,
      })
    }, 5000);

    this.setState({
      ...matchState,
      matchMessages,
    })
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.state.gameState) {
      if (!this.state.matchMenu && event.keyCode === 27) {
        this.setState({
          matchMenu: true
        })
      }
      return;
    } else if (this.state.gameState === Models.GameState.GameOver && event.keyCode === 82) {
      this.multiplayer.restart();
    } else if (this.state.gameState !== Models.GameState.GameOver && event.keyCode === 27) {
      this.multiplayer.togglePause();
    } else if (this.state.gameState !== Models.GameState.Active) {
      return;
    } else if (event.keyCode === 90) {
      this.multiplayer.rotateLeft();
    } else if (event.keyCode === 38) {
      this.multiplayer.rotateRight();
    } else if (event.keyCode === 39) {
      this.multiplayer.moveRight();
    } else if (event.keyCode === 37) {
      this.multiplayer.moveLeft();
    } else if (event.keyCode === 40) {
      this.multiplayer.drop();
    } else if (event.keyCode === 32) {
      this.multiplayer.drop(true);
    }
  }
}

export default App;
