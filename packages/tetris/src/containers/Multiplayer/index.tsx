import * as React from "react";
import { Functions, Models, Multiplayer as MultiplayerAction } from "tetris-core";
import { GameOver } from "../../components/GameOver";
import Menu from "../../components/Menu";
import { NextPiece } from "../../components/NextPiece";
import { Paused } from "../../components/Paused";
import Playfield from "../../components/Playfield";
import { gameOverMenu, pauseMenu } from "../App";
import "./index.css";

export const Multiplayer = (props: MultiplayerAction.MultiplayerState & { handle: any; menuClose?: any; }) => {
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
                {/* TODO: use game state instead of player1 gamestate */}
                {props.gameState === Models.GameState.Paused &&
                    <div>
                        <Paused />
                        <Menu menu={pauseMenu} notify={props.handle} menuClose={props.menuClose} />
                    </div>
                }
                {props.gameState === Models.GameState.GameOver && 
                    <div>
                        <GameOver />
                        <Menu menu={gameOverMenu} notify={props.handle}/>
                    </div>
                }
                {props.winner !== undefined ? `Player ${props.winner + 1} wins!` : null}
            </div>
        </div>
    );
};
