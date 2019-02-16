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
        className={`${styles.playfield} ${styles[props.size || "large"]} ${props.gameState === Models.GameState.Paused ? styles.paused : ""}`}
        matrix={props.playfield}
        size={props.size}
    />;

export default Playfield;
