import { Game, GameState } from "src/models";
import { Tetris } from "./Tetris";

export enum Player {
    One,
    Two,
};

export type Handler = (game: any) => void;

export interface MultiplayerState {
    winner?: Player;
    gameState: GameState;
    player1: Game;
    player2: Game;
}

export class Multiplayer {
    private subscribers: Set<Handler>;
    private multiplayerState: MultiplayerState;
    private player1: Tetris;
    private player2: Tetris;
    private players: Tetris[];

    private refreshLoop: NodeJS.Timeout;

    constructor() {
        this.player1 = new Tetris();
        this.player2 = new Tetris();
        this.players = [this.player1, this.player2];
        this.subscribers = new Set<Handler>();
        this.initializeState();
        this.updatePlayer1State = this.updatePlayer1State.bind(this);
        this.updatePlayer2State = this.updatePlayer2State.bind(this);
        this.player1.subscribe(this.updatePlayer1State);
        this.player2.subscribe(this.updatePlayer2State);
    }

    public moveLeft(player: Player) {
        return this.players[player].moveLeft();
    }

    public moveRight(player: Player) {
        return this.players[player].moveRight();
    }

    public rotateRight(player: Player) {
        return this.players[player].rotateRight();
    }

    public rotateLeft(player: Player) {
        return this.players[player].rotateLeft();
    }

    public togglePause() {
        this.players[Player.One].togglePause();
        this.players[Player.Two].togglePause();
    }

    public drop(player: Player, tick: boolean, hardDrop?: boolean): Promise<void> {
        return this.players[player].drop(tick, hardDrop);
    }

    // public endGame(player: Player) {
    //     clearInterval(this.refreshLoop);
    //     return this.players[player].endGame();
    // }
    
    public start() {
        this.restart();
    }

    public restart() {
        this.players[Player.One].restart();
        this.players[Player.Two].restart();
        this.initializeState();
        this.refreshLoop = setInterval(this.notify, 20);
    }

    public getState() {
        return this.multiplayerState;
    }

    public subscribe(handler: Handler) {
        this.subscribers.add(handler);
    }

    public unsubscribe(handler: Handler) {
        this.subscribers.delete(handler);
    }

    private initializeState() {
        const state = {
            winner: undefined,
            gameState: GameState.Active,
            player1: this.player1.getState(),
            player2: this.player2.getState(),
        } as MultiplayerState;

        this.setState(state);
    }

    private notify = () => {
        this.subscribers.forEach((subscriber) => subscriber(this.multiplayerState));
    }

    private setState(state: any) {
        // mutate state
        this.multiplayerState = {
            ...this.multiplayerState,
            ...state,
        }

        // this.notify();
    }

    private updatePlayer1State(player1: Game) {
        this.setState({
            player1,
        });

        if (player1.gameState === GameState.GameOver &&
            this.player2.getState().gameState !== GameState.GameOver) {
            this.setState({
                gameState: GameState.GameOver,
                winner: Player.Two,
            });
            this.player2.endGame();
        }
    }

    private updatePlayer2State(player2: Game) {
        this.setState({
            player2,
        });

        if (player2.gameState === GameState.GameOver &&
            this.player1.getState().gameState !== GameState.GameOver) {
            this.setState({
                gameState: GameState.GameOver,
                winner: Player.One,
            });
            this.player1.endGame();
        }
    }
}