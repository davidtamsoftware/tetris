import * as React from "react";
import { Piece as PieceModel } from "src/models";
import { BlockMatrix } from "../BlockMatrix";
import "./index.css";

interface Props {
    piece: PieceModel;
    size: "small" | "large";
}

export const Piece = (props: Props) =>
    <BlockMatrix
        className={`piece ${props.size}`}
        matrix={props.piece} 
        size={props.size}/>;
