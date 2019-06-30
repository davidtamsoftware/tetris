import * as React from "react";
import { MatchEvent } from "tetris-ws-model";
import { Multiplayer } from "..";
import Menu from "../../../components/Menu";
import { useMultiplayerRemote } from "../../../effects";
import { gameOverMenu, gameOverNoRestartMenu, matchMenu, pauseMenu, Props } from "../../App";
import styles from "./index.module.css";

const MultiplayerRemote = (props: Props) => {
  const {
    state,
    multiplayer,
    matchIdInput,
    handleMenuSelect,
    handleSubmitMatchId,
    handleMatchMenuSelect,
    handleMatchMenuClose
  } = useMultiplayerRemote(props.exit);

  if (!state.matchId) {
    return <>
      {!state.matchMenu &&
          <form className={styles.matchmaking} onSubmit={handleSubmitMatchId}>
              <label>Enter new/existing match id:</label>
              <input maxLength={10}
                className={styles.matchId} required autoFocus
                ref={matchIdInput} type="text" />
              <button>Submit</button>
          </form>}
      {state.matchMenu &&
        <Menu menu={matchMenu} notify={handleMatchMenuSelect} menuClose={handleMatchMenuClose} />
      }
    </>;
  } else if (!state.player1 || !state.player2) {
    return <>
      {`${state.playerCount}/2`} <br />
      {state.matchEvent === MatchEvent.DISCONNECTED && "Disconnected from server"}
      {state.matchEvent === MatchEvent.MATCH_FULL && `Game with match id ${state.matchId} is full`}
      {state.matchEvent === undefined && "Waiting for challenger to join..."}
      {state.matchMessages.map((msg, index) => <div key={index}>{msg}</div>)}
      {state.matchMenu &&
        <Menu menu={matchMenu} notify={handleMatchMenuSelect} menuClose={handleMatchMenuClose} />
      }
    </>;
  }
  else {
    let menu;
    if (state.playerCount < 2 || state.matchEvent === MatchEvent.DISCONNECTED) {
      menu = <Menu menu={gameOverNoRestartMenu} notify={handleMenuSelect} />;
    } else {
      menu = <Menu menu={gameOverMenu} notify={handleMenuSelect} />;
    }

    return <>
      {`${state.playerCount}/2`} <br />
      {state.matchEvent === MatchEvent.DISCONNECTED && "Disconnected from server"}
      {state.matchMessages.map((msg, index) => <div key={index}>{msg}</div>)}
      <Multiplayer
        {...state}
        pauseMenu={<Menu menu={pauseMenu} notify={handleMenuSelect} menuClose={multiplayer.togglePause.bind(multiplayer)} />}
        gameOverMenu={menu}
        customGameWinner={<div>You {state.winner === state.player ? "win" : "lose"}</div>}
      />
    </>;
  }
};

export default MultiplayerRemote;
