import * as React from "react";
import { Models } from "tetris-core";
import styles from "./index.module.css";

interface Props {
    scoreboard: Models.Scoreboard;
}

export const Scoreboard = (props: Props) => (
    <table className={styles.scoreboard}>
        <tbody>
            <tr>
                <td colSpan={2}><h2>Scoreboard</h2></td>
            </tr>
            <tr>
                <td>High Score</td>
                <td>{props.scoreboard.highscore}</td>
            </tr>
            <tr>
                <td>Score</td>
                <td>{props.scoreboard.score}</td>
            </tr>
            <tr>
                <td>Lines</td>
                <td>{props.scoreboard.lines}</td>
            </tr>
            <tr>
                <td>Level</td>
                <td>{props.scoreboard.level}</td>
            </tr>
        </tbody>
    </table>
);
