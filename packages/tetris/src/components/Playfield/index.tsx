import * as React from "react";
import "./index.css";
import { Playfield as PlayfieldModel, GameState } from "src/models";
import { Block } from "../Block";

interface Props {
    gameState: GameState;
    playfield: PlayfieldModel;
    size?: "small" | "large";
}

export const Playfield = (props: Props) => {
    const board = [];
    for (let i = 0; i < props.playfield.length; i++) {
        const row = [];
        for (let j = 0; j < props.playfield[i].length; j++) {
            row.push(<td key={j}>
                {props.playfield[i][j] ? <Block data={props.playfield[i][j]} size={props.size} /> : null}
            </td>);
        }
        board.push(<tr key={i}>{row}</tr>)
    }

    return (<table className={`playfield ${props.size || "large"} ${props.gameState === GameState.Paused ? "paused" : ""}`}>
        <tbody>
            {board}
        </tbody>
    </table>)
};

export default Playfield;
