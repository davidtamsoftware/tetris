import * as React from "react";
import { Piece as PieceModel } from "src/models";
import { BlockMatrix } from "../BlockMatrix";

interface Props {
    piece: PieceModel;
    size: "small" | "large";
}

export const Piece = (props: Props) =>
    <BlockMatrix
        style={{ borderSpacing: "0", margin: "auto" }} 
        matrix={props.piece} 
        size={props.size}/>;
