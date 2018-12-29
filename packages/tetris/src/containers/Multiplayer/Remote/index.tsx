import * as React from "react";
import { Models, Multiplayer as MultiplayerAction } from "tetris-core";
import { Multiplayer } from "..";
import { Key, Props, matchMenu } from "../../App";
import { MultiplayerRemoteClient } from "./RemoteClient";
import styles from "./index.module.css";
import Menu from "../../../components/Menu";

class App extends React.Component<Props, MultiplayerAction.MultiplayerState & { matchId?: string, matchMenu?: boolean }> {

  private multiplayer: MultiplayerRemoteClient;
  private matchIdInput: HTMLInputElement | null;

  constructor(props: Props) {
    super(props);
    this.multiplayer = new MultiplayerRemoteClient();
    this.state = this.multiplayer.getState();
    this.handle = this.handle.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.matchIdInput = null;
  }

  public componentWillMount() {
    document.addEventListener("keydown", this.handleKeyDown);
    this.multiplayer.subscribe(this.handle);
  }

  public componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
    this.multiplayer.unsubscribe(this.handle);
    this.multiplayer.disconnect();
  }

  public componentDidMount() {
    // this.multiplayer.start();
    this.matchIdInput!.focus();
  }

  public render() {
    if (!this.state.matchId) {
      return <div className={styles.matchmaking}>
        <div>Enter new/existing match id:</div>
        <div><input ref={(input) => { this.matchIdInput = input; }} type={"text"} onKeyPress={this.setMatchId} /></div>
        <div><button>Submit</button></div>
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
        {this.state.matchMenu &&
          <Menu menu={matchMenu} notify={this.handleMatchMenuSelect} menuClose={this.handleMenuClose} />
        }
      </div>;
    } else if (!this.state.player1 || !this.state.player2) {
      return <div>
      Waiting for challenger to join...
      {this.state.matchMenu &&
        <Menu menu={matchMenu} notify={this.handleMatchMenuSelect} menuClose={this.handleMenuClose} />
      }
      </div>
    }
    else {
      return <Multiplayer {...this.state} handle={this.handleMenuSelect} />;
    }
  }

  private setMatchId = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const matchId = (e.target as any).value;
    if (e.key === 'Enter' && matchId) {
      this.setState({ matchId }, () => {
        this.multiplayer.join(matchId);
      });
    }
  }

  private handleMatchMenuSelect = (key: Key) => {
    if (key === "QUIT_CONFIRM") {
      this.props.exit();
    } else if (key === "QUIT_CANCEL") {
      this.setState({

      });
      return false;
    }
    return true;
  }

  private handleMenuClose = () => {
    this.setState({
      matchMenu: false,
    })
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

  private handle(multiplayerState: MultiplayerAction.MultiplayerState) {
    this.setState({
      ...multiplayerState,
    });
  }

  private handleKeyDown(event: KeyboardEvent) {
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
