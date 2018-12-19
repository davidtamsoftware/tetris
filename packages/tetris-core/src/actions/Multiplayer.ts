import { Game, GameState } from "../models";
import { Tetris } from "./Tetris";

export enum Player {
    One,
    Two,
}

type Handler = (game: any) => void;

export interface MultiplayerState {
    winner?: Player;
    gameState: GameState;
    player1: Game;
    player2: Game;
}

// TODO: move subsribe into start, unsub in end
// use players array and get rid of player 1 and player 2 intance var

export class Multiplayer {
    private lastState: string;
    private subscribers: Set<Handler>;
    private multiplayerState: MultiplayerState | any;
    private player1: Tetris;
    private player2: Tetris;
    private players: Tetris[];

    private refreshLoop?: number;

    constructor() {
        this.player1 = new Tetris();
        this.player2 = new Tetris();
        this.players = [this.player1, this.player2];
        this.subscribers = new Set<Handler>();
        this.initializeState();
        this.lastState = JSON.stringify(this.multiplayerState);
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

    // public endGame() {
    //     this.players[Player.One].endGame();
    //     // this.players[Player.Two].endGame();
    //     // this.notify();
    //     // clearInterval(this.refreshLoop);
    // }

    public drop(player: Player, tick: boolean, hardDrop?: boolean): Promise<void> {
        return this.players[player].drop(tick, hardDrop);
    }

    public endGame(player?: Player) {
        clearInterval(this.refreshLoop);
        if (player) {
            this.players[player].endGame();
        } else {
            this.player1.endGame();
            this.player2.endGame();
            this.setState({
                gameState: GameState.GameOver,
                winner: undefined,
            });
        }
    }

    public start() {
        this.restart();
    }

    public restart() {
        this.players[Player.One].restart();
        this.players[Player.Two].restart();
        this.initializeState();
        this.refreshLoop = setInterval(this.notify, 35);
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
        if (this.lastState === JSON.stringify(this.multiplayerState)) {
            // tslint:disable-next-line:no-console
            console.log("didn't notify");
            return;
        }
        this.subscribers.forEach((subscriber) => subscriber(this.multiplayerState));
        this.lastState = JSON.stringify(this.multiplayerState);
    }

    private setState(state: any) {
        // mutate state
        this.multiplayerState = {
            ...this.multiplayerState,
            ...state,
        };

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
            this.notify();
            clearInterval(this.refreshLoop);
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
            this.notify();
            clearInterval(this.refreshLoop);
        }
    }
}
