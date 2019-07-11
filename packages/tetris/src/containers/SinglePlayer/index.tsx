import * as React from "react";
import { Functions, Models } from "tetris-core";
import { Controls } from "../../components/Controls";
import Menu from "../../components/Menu";
import { NextPiece } from "../../components/NextPiece";
import { Playfield } from "../../components/Playfield";
import { Scoreboard } from "../../components/Scoreboard";
import { Stats } from "../../components/Stats";
import { useTetris } from "../../hooks";
import { gameOverMenu, pauseMenu, Props } from "../App";
import styles from "./index.module.css";

const SinglePlayer = (props: Props) => {
    const { game, handleMenuClose, handleMenuSelect } = useTetris(props.exit);

    if (!game.playfield) {
        return null;
    }

    const result = Functions.merge(game.playfield, game.position, game.piece);

    return (
        <div className={styles.App}>
            <div className={styles.left}>
                <Controls />
                <NextPiece piece={game.nextPiece} />
            </div>
            <div className={styles.right}>
                <Scoreboard scoreboard={game.scoreboard} />
                <Stats stats={game.stats} />
            </div>
            <div className={styles.main}>
                <Playfield playfield={result.playfield} gameState={game.gameState} />
                {game.gameState === Models.GameState.Paused &&
                    <div className={styles.menu}>
                        <Menu menu={pauseMenu} notify={handleMenuSelect} menuClose={handleMenuClose} />
                    </div>
                }
                {game.gameState === Models.GameState.GameOver &&
                    <div className={styles.menu}>
                        <Menu menu={gameOverMenu} notify={handleMenuSelect} />
                    </div>
                }
            </div>
        </div>
    );
}

export default SinglePlayer;
