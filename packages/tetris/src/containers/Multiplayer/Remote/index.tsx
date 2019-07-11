import * as React from "react";
import { MatchEvent } from "tetris-ws-model";
import { Multiplayer } from "..";
import Menu from "../../../components/Menu";
import { useMultiplayerRemote } from "../../../hooks";
import { gameOverMenu, gameOverNoRestartMenu, matchMenu, pauseMenu, Props } from "../../App";
import styles from "./index.module.css";

const MultiplayerRemote = (props: Props) => {
  const {
    game,
    handleMenuClose,
    matchIdInput,
    handleMenuSelect,
    handleSubmitMatchId,
    handleMatchMenuSelect,
    handleMatchMenuClose
  } = useMultiplayerRemote(props.exit);

  if (!game.matchId) {
    return <>
      {!game.matchMenu &&
          <form className={styles.matchmaking} onSubmit={handleSubmitMatchId}>
              <label>Enter new/existing match id:</label>
              <input maxLength={10}
                className={styles.matchId} required autoFocus
                ref={matchIdInput} type="text" />
              <button>Submit</button>
          </form>}
      {game.matchMenu &&
        <Menu menu={matchMenu} notify={handleMatchMenuSelect} menuClose={handleMatchMenuClose} />
      }
    </>;
  } else if (!game.player1 || !game.player2) {
    return <>
      {`${game.playerCount}/2`} <br />
      {game.matchEvent === MatchEvent.DISCONNECTED && "Disconnected from server"}
      {game.matchEvent === MatchEvent.MATCH_FULL && `Game with match id ${game.matchId} is full`}
      {game.matchEvent === undefined && "Waiting for challenger to join..."}
      {game.matchMessages.map((msg, index) => <div key={index}>{msg}</div>)}
      {game.matchMenu &&
        <Menu menu={matchMenu} notify={handleMatchMenuSelect} menuClose={handleMatchMenuClose} />
      }
    </>;
  }
  else {
    let menu;
    if (game.playerCount < 2 || game.matchEvent === MatchEvent.DISCONNECTED) {
      menu = <Menu menu={gameOverNoRestartMenu} notify={handleMenuSelect} />;
    } else {
      menu = <Menu menu={gameOverMenu} notify={handleMenuSelect} />;
    }

    return <>
      {`${game.playerCount}/2`} <br />
      {game.matchEvent === MatchEvent.DISCONNECTED && "Disconnected from server"}
      {game.matchMessages.map((msg, index) => <div key={index}>{msg}</div>)}
      <Multiplayer
        {...game}
        pauseMenu={<Menu menu={pauseMenu} notify={handleMenuSelect} menuClose={handleMenuClose} />}
        gameOverMenu={menu}
        customGameWinner={<div>You {game.winner === game.player ? "win" : "lose"}</div>}
      />
    </>;
  }
};

export default MultiplayerRemote;
