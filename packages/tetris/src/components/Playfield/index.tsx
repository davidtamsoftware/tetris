import * as React from 'react';
import './index.css';
import { Playfield as PlayfieldModel, GameState } from 'src/models';
import { Block } from '../Block';

interface Props {
    gameState: GameState;
    playfield: PlayfieldModel;
}

export const Playfield = (props: Props) => {
    const board = [];
    for (let i = 0; i < props.playfield.length; i++) {
        const row = [];
        for (let j = 0; j < props.playfield[i].length; j++) {
            row.push(<td key={j}
                style={{
                    border: "1px solid black",
                    backgroundColor: "black",
                    width: "25px",
                    height: "26px",
                    padding: "0",
                }}>
                <Block data={props.playfield[i][j]} />
            </td>);
        }
        board.push(<tr key={i}>{row}</tr>)
    }

    return (<table style={{
        filter: `grayscale(${props.gameState === GameState.Paused ? "80" : "0"}%)`,
        borderRadius: "0px",
        border: "3px solid white",
        borderSpacing: "0",
        margin: "auto"
    }}>
        <tbody>
            {board}
        </tbody>
    </table>)
};

export default Playfield;
