import { Playfield } from './Playfield';
import { PiecePosition } from './PiecePosition';
import { Piece } from './Piece';
import { Stats } from './Stats';
import { Scoreboard } from './Scoreboard';

export enum GameState {
    Paused,
    Active,
    GameOver,
};

export interface Game {
    playfield: Playfield;
    position: PiecePosition;
    piece: Piece;
    gameState: GameState;
    stats: Stats;
    scoreboard: Scoreboard;
    nextPiece: Piece;
}
