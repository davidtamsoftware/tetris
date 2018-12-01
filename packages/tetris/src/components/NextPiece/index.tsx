import * as React from "react";
import { Models } from "tetris-core";
import { Piece } from "../Piece";

export const NextPiece = ({ piece }: { piece: Models.Piece }) => (
    <div>
        <h2>Next</h2>
        <Piece piece={piece} size={"large"} />
    </div>
);
