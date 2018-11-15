import * as React from "react";
import { Piece as PieceModel } from "src/models";
import { Block } from "../Block";

interface Props {
    piece: PieceModel;
    size: "small" | "large";
}

export const Piece = (props: Props) => (
    <table style={{ borderSpacing: "0", margin: "auto" }}>
        <tbody>
            {props.piece.map((r) => (
                <tr>
                    {r.map((c) => (
                    <td style={{ 
                        border: `${props.size === "small" ? "0" : "1"}px solid #131010`, 
                        padding: "0" }}>
                        {c ? <Block data={c} size={props.size} /> : null}
                    </td>))}
                </tr>
            ))}
        </tbody>
    </table>
);
