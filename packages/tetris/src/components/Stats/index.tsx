import * as React from "react";
import { pieces, Stats as StatsModel } from "../../models";
import { Piece } from "../Piece";

interface Props {
    stats: StatsModel;
}

export const Stats = (props: Props) => {
    const counts = pieces.map((piece) => (
        <tr>
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