import * as React from "react";
import { Fill } from "tetris-core/lib/models";
import styles from "./index.module.css";

interface Props {
    data: Fill;
    size?: "small" | "large";
}

const colors = ["black", "orange", "yellow", "green", "blue", "gray", "red", "purple", "white"];

export const Block = (props: Props) => (
    <div className={`${styles.block} ${styles[colors[props.data]]} ${styles[props.size || "large"]}`} />
);
