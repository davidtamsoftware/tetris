import * as React from "react";
import "./index.css";

interface Props {
    data: number;
    size?: "small" | "large";
}

const colors = {
    "0": "black",
    "1": "orange #c88a19 darkorange orange",
    "2": "yellow #ebeb5e #afaf59 yellow",
    "3": "green lightgreen darkgreen green",
    "4": "blue lightblue darkblue blue",
    "5": "gray lightgray darkgray gray",
    "6": "red brown darkred red",
    "7": "purple #892289 #5a065a purple",
    "8": "white",
  };

export const Block = (props: Props) => (
    <div className={`block ${colors[props.data].split(" ")[0]} ${props.size || "large"}`}/>
);
