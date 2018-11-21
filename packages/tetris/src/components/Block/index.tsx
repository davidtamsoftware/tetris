import * as React from "react";
import "./index.css";

interface Props {
    data: number;
    size?: "small" | "large";
}

const colors = ["black", "orange", "yellow", "green", "blue", "gray", "red", "purple", "white"];

export const Block = (props: Props) => (
    <div className={`block ${colors[props.data].split(" ")[0]} ${props.size || "large"}`}/>
);
