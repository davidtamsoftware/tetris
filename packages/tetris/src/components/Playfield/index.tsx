import * as React from "react";
import "./index.css";
import { Playfield as PlayfieldModel, GameState, Fill } from "src/models";
import { BlockMatrix } from "../BlockMatrix";

interface Props {
    gameState: GameState;
    playfield: PlayfieldModel;
    size?: "small" | "large";
}

export const Playfield = (props: Props) => 
    <BlockMatrix 
        className={`playfield ${props.size || "large"} ${props.gameState === GameState.Paused ? "paused" : ""}`}
        matrix={props.playfield}
        size={props.size}
    />;

export default Playfield;
