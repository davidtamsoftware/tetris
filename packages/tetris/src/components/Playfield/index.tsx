import * as React from "react";
import { Models } from "tetris-core";
import { BlockMatrix } from "../BlockMatrix";
import styles from "./index.module.css";

interface Props {
    gameState: Models.GameState;
    playfield: Models.Playfield;
    size?: "small" | "large";
}

export const Playfield = (props: Props) => 
    <BlockMatrix 
        className={
            `playfield ${props.size || "large"} ${props.gameState === Models.GameState.Paused ? "paused" : ""}`
                .split(" ")
                .map((entry) => styles[entry])
                .reduce((a, b) => a + " " + b)
        }
        matrix={props.playfield}
        size={props.size}
    />;

export default Playfield;
