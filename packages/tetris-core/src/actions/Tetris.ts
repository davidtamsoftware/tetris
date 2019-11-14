import {
    appendRandomLines,
    calculatePosition,
    generateRandomPiece,
    hasCollision,
    moveDown,
    moveLeft,
    moveRight,
    rotateLeft,
    rotateRight,
} from ".";
import { Fill, Game, GameState, pieces, Playfield, playfield as initialPlayfield } from "../models";
import GameActions from "./GameActions";
import PlayerActions from "./PlayerActions";

type Handler = (game: Game) => void;

/**
 * payload can be a custom object for event (ie. damage event will send
 * payload with number of damage lines)
 */
export type EventHandler = (event: Event, payload?: any) => void;

export enum Event {
    Damage,
    Single,
    Double,
    Triple,
    Tetris,
    Drop,
    GameOver,
    RotateLeft,
    RotateRight,
    PauseIn,
    PauseOut,
    Start,
    Attack,
}

export interface HighScoreService {
    getHighScore(): number;
    saveHighScore(score: number): void;
}

/**
 * @class Tetris
 * @description Contains the logic for tetris actions and uses pure functions to transform playfield contents
 * and save state to memory.
 */
export class Tetris implements PlayerActions, GameActions {

    private subscribers: Set<Handler>;
    private eventSubscribers: Map<EventHandler, Event[]>;
    private game?: Game;
    private freezeSemaphore: boolean;
    private loop: any; // setInterval
    private refreshLoop: any; // setInterval
    private pieceGenerator?: () => Fill[][];
    private highScoreService?: HighScoreService;

    constructor(pieceGenerator?: () => Fill[][], highScoreService?: HighScoreService) {
        this.freezeSemaphore = false;
        this.subscribers = new Set<Handler>();
        this.eventSubscribers = new Map<EventHandler, Event[]>();
        this.pieceGenerator = pieceGenerator;
        this.highScoreService = highScoreService;
    }

    public moveLeft() {
        if (this.game!.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = moveLeft(this.game!.playfield, this.game!.position, this.game!.piece);
        this.setState({
            position,
            piece,
        });
    }

    public moveRight() {
        if (this.game!.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = moveRight(this.game!.playfield, this.game!.position, this.game!.piece);
        this.setState({
            position,
            piece,
        });
    }

    public rotateRight() {
        if (this.game!.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = rotateRight(this.game!.playfield, this.game!.position, this.game!.piece);
        this.setState({
            position,
            piece,
        });

        this.publishEvent(Event.RotateRight);
    }

    public rotateLeft() {
        if (this.game!.gameState !== GameState.Active) {
            return;
        }

        const { position, piece } = rotateLeft(this.game!.playfield, this.game!.position, this.game!.piece);
        this.setState({
            position,
            piece,
        });

        this.publishEvent(Event.RotateLeft);
    }

    public togglePause() {
        if (this.game!.gameState === GameState.GameOver) {
            return;
        }

        this.publishEvent(this.game!.gameState === GameState.Paused ? Event.PauseOut : Event.PauseIn);
        this.setState({
            gameState: this.game!.gameState === GameState.Paused ? GameState.Active : GameState.Paused,
        });

    }

    public drop(hardDrop?: boolean) {
        return this.moveDown(false, hardDrop);
    }

    public endGame() {
        if (this.getState().gameState === GameState.GameOver) {
            return;
        }

        if (this.highScoreService) {
            this.highScoreService.saveHighScore(this.getState().scoreboard.highscore);
        }

        this.setState({
            gameState: GameState.GameOver,
        });
        this.publishEvent(Event.GameOver);
        this.notify();
        clearInterval(this.refreshLoop);
        clearInterval(this.loop);
    }

    public start() {
        this.restart();
    }

    public restart() {
        this.changeLevel(1);
        this.setState(this.initializeState());
        this.refreshLoop = setInterval(this.notify, 20);
        this.publishEvent(Event.Start);
    }

    public getState(): Game {
        // deep copy
        return JSON.parse(JSON.stringify(this.game || {}));
    }

    public subscribe(handler: Handler) {
        this.subscribers.add(handler);
    }

    public unsubscribe(handler: Handler) {
        this.subscribers.delete(handler);
    }

    /**
     * Subscribe to events that are published.
     *
     * @param {EventHandler} handler
     * @param {...Event[]} event specific events to subscribe to. If left empty,
     * then handler will subscribe to all events
     * @memberof Tetris
     */
    public subscribeToEvent(handler: EventHandler, ...events: Event[]) {
        this.eventSubscribers.set(handler, events);
    }

    public unsubscribeToEvent(handler: EventHandler) {
        this.eventSubscribers.delete(handler);
    }

    // TODO make this more hidden so it cannot be invoked from a client.
    public damage = (event: Event, count: number) => {
        this.setState({
            pendingDamage: this.getState().pendingDamage + count,
        });
    }

    private async moveDown(tick: boolean, hardDrop?: boolean) {
        // ignore calls to drop while freeze semaphore is active
        if (this.game!.gameState === GameState.Active && !this.freezeSemaphore) {
            this.freezeSemaphore = true;
            const result = await moveDown(
                this.game!.playfield,
                this.game!.position,
                this.game!.piece,
                this.addScore,
                this.addLines,
                this.updateGame,
                this.publishEvent,
                tick,
                hardDrop);

            let nextPiece;
            if (!result.piece) {
                if (this.getState().pendingDamage) {
                    this.publishEvent(Event.Damage);
                    const playfield =
                        await appendRandomLines(result.playfield, this.getState().pendingDamage, this.updateGame);
                    this.setState({
                        pendingDamage: 0,
                    });

                    result.playfield = playfield;
                }

                const position = calculatePosition(this.game!.playfield, this.game!.nextPiece);
                result.piece = this.game!.nextPiece;
                result.position = position;

                nextPiece = this.pieceGenerator ? this.pieceGenerator() : generateRandomPiece();
                this.incrementCount(result.piece.toString());

                // check if new piece has collision with new playfield, if so then game over
                if (hasCollision(result.playfield, position, result.piece)) {
                    result.gameover = GameState.GameOver;
                }
            }

            this.setState({
                ...result,
                nextPiece: nextPiece ? nextPiece : this.game!.nextPiece,
            });

            if (result.gameover) {
                this.endGame();
            }
            this.freezeSemaphore = false;
        }
    }

    private changeLevel(level: number) {
        clearInterval(this.loop);
        this.loop = setInterval(() => this.moveDown(true), 1000 / level);
    }

    private initializeState() {
        const randomPiece = this.pieceGenerator ? this.pieceGenerator() : generateRandomPiece();
        const state = {
            pendingDamage: 0,
            playfield: initialPlayfield,
            piece: randomPiece,
            nextPiece: this.pieceGenerator ? this.pieceGenerator() : generateRandomPiece(),
            position: calculatePosition(initialPlayfield, randomPiece),
            gameState: GameState.Active,
            scoreboard: {
                level: 1,
                lines: 0,
                highscore: (this.highScoreService && this.highScoreService.getHighScore()) || 0,
                score: 0,
            },
            stats: pieces
                .map((item) => ({ [item.toString()]: item === randomPiece ? 1 : 0 }))
                .reduce((acc, item) => ({ ...acc, ...item })),
        };
        this.setState(state);
    }

    private incrementCount = (pieceKey: string) => {
        const stats = {
            ...this.game!.stats,
            [pieceKey]: this.game!.stats[pieceKey] + 1,
        };

        this.setState({
            stats,
        });
    }

    private addScore = (score: number) => {
        const newScore = this.game!.scoreboard.score + score;
        this.setState({
            scoreboard: {
                ...this.game!.scoreboard,
                score: newScore,
                highscore: this.game!.scoreboard.highscore > newScore ? this.game!.scoreboard.highscore : newScore,
            },
        });
    }

    private addLines = (lines: number) => {
        const pts = [0, 40, 100, 300, 400];

        const level = Math.floor((this.game!.scoreboard.lines + lines) / 10) + 1;
        const score = this.game!.scoreboard.score + this.game!.scoreboard.level * pts[lines];

        if (this.game!.scoreboard.level !== level) {
            this.changeLevel(level);
        }

        const damageLines = [0, 0, 0, 1, 2];
        const damage = {} as any;
        if (lines <= this.game!.pendingDamage) {
            damage.pendingDamage = this.game!.pendingDamage - damageLines[lines];
        } else {
            damage.pendingDamage = 0;
            this.publishEvent(Event.Attack, damageLines[lines] - this.game!.pendingDamage);
        }

        this.setState({
            ...damage,
            scoreboard: {
                ...this.game!.scoreboard,
                highscore: this.game!.scoreboard.highscore > score ? this.game!.scoreboard.highscore : score,
                lines: this.game!.scoreboard.lines + lines,
                score,
                level,
            },
        });
    }

    // used for animating line removal
    private updateGame = (playfield: Playfield) => {
        this.setState({
            playfield,
            piece: [],
        });
    }

    private notify = () => {
        this.subscribers.forEach((subscriber) => subscriber(this.game!));
    }

    private publishEvent = (event: Event, payload?: any) => {
        this.eventSubscribers.forEach((events, handler) => {
            if (events.length === 0 || events.indexOf(event) >= 0) {
                handler(event, payload);
            }
        });
    }

    private setState(state: any) {
        // mutate state
        this.game = {
            ...this.game,
            ...state,
        };
    }
}
