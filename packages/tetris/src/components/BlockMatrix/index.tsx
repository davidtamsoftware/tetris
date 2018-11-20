import * as React from "react";
import { Fill } from "src/models";
import { Block } from "../Block";

interface Props {
        matrix: Fill[][];
        size?: "small" | "large";
        className?: string;
        style?: React.CSSProperties;
}

export const BlockMatrix = (props: Props) => (
    <table className={props.className} style={props.style}>
        {props.matrix.map((row) => (
            <tr>
                {row.map((col, index) => <td key={index}>{col ? <Block data={col} size={props.size} /> : null}</td>)}
            </tr>
        ))}
    </table>);