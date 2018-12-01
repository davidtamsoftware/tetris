import * as React from "react";
import { Functions, Models, Multiplayer as MultiplayerAction } from "tetris-core";
// import { merge } from "src/actions";
// import { MultiplayerState } from "src/actions/Multiplayer";
// import { Game, GameState } from "src/models";
import { GameOver } from "../GameOver";
import { NextPiece } from "../NextPiece";
import { Paused } from "../Paused";
import Playfield from "../Playfield";
import "./index.css";

export const Multiplayer = (props: MultiplayerAction.MultiplayerState) => {
    if (!props.player1 || !props.player2) {
        return null;
    }
    
    const result1 = Functions.merge(props.player1.playfield, props.player1.position, props.player1.piece);
    const result2 = Functions.merge(props.player2.playfield, props.player2.position, props.player2.piece);

    return (
        <div className="App">
            <div className="left">
                <Playfield playfield={result1.playfield} gameState={props.player1.gameState} />
            </div>
            <div className="right">
                <Playfield playfield={result2.playfield} gameState={props.player2.gameState} />
            </div>
            <div className="main">
                <table style={{ margin: "auto", width: "400px", border: "0px solid purple" }}>
                    <tr>
                        <td><NextPiece piece={props.player1.nextPiece} /></td>
                        <td><NextPiece piece={props.player2.nextPiece} /></td>
                    </tr>
                </table>
                <table style={{ position: "absolute", left: "35%", bottom: "55px", width: "400px", border: "0px solid purple" }}>
                    <tr>
                        <td><h2>Score<br /><br />{props.player1.scoreboard.score}</h2></td>
                        <td><h2>Score<br /><br />{props.player2.scoreboard.score}</h2></td>
                    </tr>
                </table>
                {props.player1.gameState === Models.GameState.Paused && <Paused />}
                {props.player1.gameState === Models.GameState.GameOver && <GameOver />}
                {props.winner !== undefined ? `Player ${props.winner+1} wins!`:null}
            </div>
        </div>
    );
};
