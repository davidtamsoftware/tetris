import {
    calculatePosition,
    generateRandomPiece,
    hasCollision,
    moveDown,
    moveLeft,
    moveRight,
    rotateLeft,
    rotateRight,
} from ".";
import { Game, GameState, pieces, Playfield, playfield as initialPlayfield } from "../models";

type Handler = (game: Game) => void;

/**
 * @class Tetris
 * @description Contains the logic for tetris actions and uses pure functions to transform playfield contents
 * and save state to memory.
 */

export class Tetris {

    private subscribers: Set<Handler>;
    private game: Game | any;
    private freezeSemaphore: boolean;
    private loop?: number;
    private refreshLoop?: number;

    constructor() {
        this.freezeSemaphore = false;
        this.incrementCount = this.incrementCount.bind(this);
        this.addLines = this.addLines.bind(this);
        this.addScore = this.addScore.bind(this);
        this.updateGame = this.updateGame.bind(this);
        this.subscribers = new Set<Handler>();
        this.initializeState();
    }

    public moveLeft() {
        if (this.game.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = moveLeft(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public moveRight() {
        if (this.game.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = moveRight(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public rotateRight() {
        if (this.game.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = rotateRight(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public rotateLeft() {
        if (this.game.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = rotateLeft(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public togglePause() {
        if (this.game.gameState === GameState.GameOver) {
            return;
        }

        this.setState({
            gameState: this.game.gameState === GameState.Paused ? GameState.Active : GameState.Paused,
        });
    }

    public async drop(tick: boolean, hardDrop?: boolean) {
        if (this.game.gameState === GameState.Active && !this.freezeSemaphore) {
            this.freezeSemaphore = true;
            const result = await moveDown(
                this.game.playfield,
                this.game.position,
                this.game.piece,
                this.addScore,
                this.addLines,
                this.updateGame,
                tick,
                hardDrop);

            this.freezeSemaphore = false;

            let nextPiece;
            if (!result.piece) {
                const position = calculatePosition(this.game.playfield, this.game.nextPiece);
                result.piece = this.game.nextPiece;
                result.position = position;
                nextPiece = generateRandomPiece();
                this.incrementCount(result.piece.toString());

                // check if new piece has collision with new playfield, if so then game over
                if (hasCollision(result.playfield, position, result.piece)) {
                    result.gameover = GameState.GameOver;
                }
            }

            this.setState({
                ...result,
                nextPiece: nextPiece ? nextPiece : this.game.nextPiece,
                // gameState: result.gameover ? GameState.GameOver : GameState.Active,
            });

            if (result.gameover) {
                // clearInterval(this.loop);
                this.endGame();
            }
        }
    }

    public endGame() {
        if (this.getState().gameState === GameState.GameOver) {
            return;
        }

        this.setState({
            gameState: GameState.GameOver,
        });
        this.notify();
        clearInterval(this.refreshLoop);
        clearInterval(this.loop);
    }

    public start() {
        this.restart();
    }

    public restart() {
        this.tick(1);
        this.setState(this.initializeState());
        this.refreshLoop = setInterval(this.notify, 20);
    }

    public getState() {
        // TODO: deep copy
        return {
            ...this.game,
        };
    }

    public subscribe(handler: Handler) {
        this.subscribers.add(handler);
    }

    public unsubscribe(handler: Handler) {
        this.subscribers.delete(handler);
    }

    private tick(level: number) {
        clearInterval(this.loop);
        this.loop = setInterval(() => this.drop(true), 1000 / level);
    }

    private initializeState() {
        const randomPiece = generateRandomPiece();
        const state = {
            playfield: initialPlayfield,
            piece: randomPiece,
            nextPiece: generateRandomPiece(),
            position: calculatePosition(initialPlayfield, randomPiece),
            gameState: GameState.Active,
            scoreboard: {
                level: 1,
                lines: 0,
                // TODO: pass in score provider,
                // client can implement in localstorage, server can implement in memory or persistent
                // highscore: Number(localStorage.getItem("highscore") || 0),
                score: 0,
            },
            stats: pieces
                .map((item) => ({ [item.toString()]: item === randomPiece ? 1 : 0 }))
                .reduce((acc, item) => ({ ...acc, ...item })),
        };
        this.setState(state);
    }

    private incrementCount(pieceKey: string) {
        const stats = {
            ...this.game.stats,
            [pieceKey]: this.game.stats[pieceKey] + 1,
        };

        this.setState({
            stats,
        });
    }

    private addScore(score: number) {
        this.setState({
            scoreboard: {
                ...this.game.scoreboard,
                score: this.game.scoreboard.score + score,
            },
        });
    }

    private addLines(lines: number) {
        const pts = [0, 40, 100, 300, 400];

        const level = Math.floor((this.game.scoreboard.lines + lines) / 10) + 1;
        const score = this.game.scoreboard.score + this.game.scoreboard.level * pts[lines];

        if (this.game.scoreboard.level !== level) {
            this.tick(level);
        }

        this.setState({
            scoreboard: {
                ...this.game.scoreboard,
                highscore: this.game.scoreboard.highscore > score ? this.game.scoreboard.highscore : score,
                lines: this.game.scoreboard.lines + lines,
                score,
                level,
            },
        });
    }

    private updateGame(playfield: Playfield) {
        this.setState({
            playfield,
            piece: [],
        });
    }

    private notify = () => {
        this.subscribers.forEach((subscriber) => subscriber(this.game));
    }

    private setState(state: any) {
        // mutate state
        this.game = {
            ...this.game,
            ...state,
        };

        // this.notify();
    }
}
