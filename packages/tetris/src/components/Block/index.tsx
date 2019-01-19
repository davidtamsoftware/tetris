import * as React from "react";
import styles from "./index.module.css";

interface Props {
    data: number;
    size?: "small" | "large";
}

const colors = ["black", "orange", "yellow", "green", "blue", "gray", "red", "purple", "white"];

export const Block = (props: Props) => (
    <div className={
        `block ${colors[props.data]} ${props.size || "large"}`
            .split(" ")
            .map((entry) => styles[entry.toString()])
            .reduce((a, b) => a + " " + b)} />
);
