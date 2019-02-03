import * as React from "react";
import { Models } from "tetris-core";
import { Piece } from "../Piece";
import styles from "./index.module.css";

interface Props {
    stats: Models.Stats;
}

export const Stats = (props: Props) => {
    const counts = Models.pieces.map((piece, index) => (
        <tr key={index}>
            <td>
                <Piece piece={piece} size={"small"} />
            </td>
            <td>
                {props.stats[piece.toString()]}
            </td>
        </tr>
    ));

    return (
        <table className={styles.stats}>
            <tbody>
                <tr>
                    <td colSpan={2}><h2>Stats</h2></td>
                </tr>
                {counts}
            </tbody>
        </table>
    );
};