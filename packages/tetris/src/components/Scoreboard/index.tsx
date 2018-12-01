import * as React from "react";
import { Models } from "tetris-core";

interface Props {
    scoreboard: Models.Scoreboard;
}

export const Scoreboard = (props: Props) => (
    <table style={{ tableLayout: "fixed", border: "0px solid white", width: "100%", borderSpacing: "0 10px" }}>
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
