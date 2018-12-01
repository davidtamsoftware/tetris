import { Piece } from "./Piece";
import { PiecePosition } from "./PiecePosition";
import { Playfield } from "./Playfield";
import { Scoreboard } from "./Scoreboard";
import { Stats } from "./Stats";

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
