import * as React from "react";
import { Models } from "tetris-core";
import { BlockMatrix } from "../BlockMatrix";
import "./index.css";

interface Props {
    piece: Models.Piece;
    size: "small" | "large";
}

export const Piece = (props: Props) =>
    <BlockMatrix
        className={`piece ${props.size}`}
        matrix={props.piece} 
        size={props.size}/>;
