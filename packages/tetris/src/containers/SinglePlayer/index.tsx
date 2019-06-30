import * as React from "react";
import { Functions, Models } from "tetris-core";
import { Controls } from "../../components/Controls";
import Menu from "../../components/Menu";
import { NextPiece } from "../../components/NextPiece";
import { Playfield } from "../../components/Playfield";
import { Scoreboard } from "../../components/Scoreboard";
import { Stats } from "../../components/Stats";
import { useTetris } from "../../effects";
import { gameOverMenu, pauseMenu, Props } from "../App";
import styles from "./index.module.css";

const SinglePlayer = (props: Props) => {
    const { state, tetris, handleMenuSelect } = useTetris(props.exit);

    if (!state.playfield) {
        return null;
    }

    const result = Functions.merge(state.playfield, state.position, state.piece);

    return (
        <div className={styles.App}>
            <div className={styles.left}>
                <Controls />
                <NextPiece piece={state.nextPiece} />
            </div>
            <div className={styles.right}>
                <Scoreboard scoreboard={state.scoreboard} />
                <Stats stats={state.stats} />
            </div>
            <div className={styles.main}>
                <Playfield playfield={result.playfield} gameState={state.gameState} />
                {state.gameState === Models.GameState.Paused &&
                    <div className={styles.menu}>
                        <Menu menu={pauseMenu} notify={handleMenuSelect} menuClose={tetris.togglePause.bind(tetris)} />
                    </div>
                }
                {state.gameState === Models.GameState.GameOver &&
                    <div className={styles.menu}>
                        <Menu menu={gameOverMenu} notify={handleMenuSelect} />
                    </div>
                }
            </div>
        </div>
    );
}

export default SinglePlayer;
