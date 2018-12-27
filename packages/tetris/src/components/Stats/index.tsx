import * as React from "react";
import { Models } from "tetris-core";
import { Piece } from "../Piece";

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
        <table style={{ tableLayout: "fixed", border: "0px solid white", width: "100%", borderSpacing: "0 10px" }}>
            <tbody>
                <tr>
                    <td colSpan={2}><h2>Stats</h2></td>
                </tr>
                {counts}
            </tbody>
        </table>
    );
};