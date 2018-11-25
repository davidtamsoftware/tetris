import * as React from "react";
import { Piece as PieceModel } from "src/models";
import { Piece } from "../Piece";

export const NextPiece = ({ piece }: { piece: PieceModel }) => (
    <div>
        <h2>Next</h2>
        <Piece piece={piece} size={"large"} />
    </div>
);
