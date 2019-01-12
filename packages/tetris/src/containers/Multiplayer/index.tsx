import * as React from "react";
import { Functions, Models, Multiplayer as MultiplayerAction } from "tetris-core";
import { GameOver } from "../../components/GameOver";
import Menu from "../../components/Menu";
import { NextPiece } from "../../components/NextPiece";
import { Paused } from "../../components/Paused";
import Playfield from "../../components/Playfield";
import { gameOverMenu, pauseMenu } from "../App";
import styles from "./index.module.css";
import { MultiplayerMode } from "tetris-core/lib/actions/Multiplayer";

export const Multiplayer = (
    props: MultiplayerAction.MultiplayerState & { mode?: MultiplayerMode; handle: any; menuClose?: any; }) => {
    if (!props.player1 || !props.player2) {
        return null;
    }

    const result1 = Functions.merge(props.player1.playfield, props.player1.position, props.player1.piece);
    const result2 = Functions.merge(props.player2.playfield, props.player2.position, props.player2.piece);

    return (
        <div className={styles.App}>
{/* TODO allow user to select which mode and pass into this component */}
            { (props.mode === undefined || props.mode === MultiplayerMode.AttackMode) &&
                <div>
                <span style={{ padding: "5px"}}>{ props.player1.pendingDamage }</span>
                <span style={{ padding: "5px"}}>{ props.player2.pendingDamage }</span>
                </div>
            }
            <div className={styles.left}>
                <Playfield playfield={result1.playfield} gameState={props.player1.gameState} />
            </div>
            <div className={styles.right}>
                <Playfield playfield={result2.playfield} gameState={props.player2.gameState} />
            </div>
            <div className={styles.main}>
                <table style={{ margin: "auto", width: "400px", border: "0px solid purple" }}>
                    <tbody>
                        <tr>
                            <td><NextPiece piece={props.player1.nextPiece} /></td>
                            <td><NextPiece piece={props.player2.nextPiece} /></td>
                        </tr>
                    </tbody>
                </table>
                <table style={{ paddingTop: "295px", margin: "auto", width: "400px", border: "0px solid purple" }}>
                    <tbody>
                        <tr>
                            <td><h2>Score<br /><br />{props.player1.scoreboard.score}</h2></td>
                            <td><h2>Score<br /><br />{props.player2.scoreboard.score}</h2></td>
                        </tr>
                    </tbody>
                </table>
                {/* TODO: use game state instead of player1 gamestate */}
                {props.gameState === Models.GameState.Paused &&
                    <div style={{
                        position: "absolute",
                        left: "calc(50% - 200px - 5px - 20px)",
                        top: "200px",
                        backgroundColor: "black"
                    }}>
                        {/* <Paused /> */}
                        <Menu menu={pauseMenu} notify={props.handle} menuClose={props.menuClose} />
                    </div>
                }
                {props.gameState === Models.GameState.GameOver &&
                    <div style={{
                        position: "absolute",
                        left: "calc(50% - 200px - 5px - 20px)",
                        top: "200px",
                        backgroundColor: "black"
                    }}>
                        {/* <GameOver /> */}
                        <Menu menu={gameOverMenu} notify={props.handle} />
                    </div>
                }
                <div style={{ position: "absolute", bottom: "353px", left: "calc(50% - 85px)", textShadow: "#af89f7 1px 1px 35px, blue 0px 0px 57px, #d4bec1 0px 0px 50px" }}>
                    {props.winner === null && "Tie Game"}
                    {props.winner !== undefined && props.winner !== null && `Player ${props.winner + 1} wins!`}
                </div>
            </div>
        </div>
    );
};
