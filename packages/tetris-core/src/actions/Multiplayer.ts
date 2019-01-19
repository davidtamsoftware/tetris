import { generateRandomPiece } from ".";
import { Fill, Game, GameState } from "../models";
import { Event, EventHandler, Tetris } from "./Tetris";

export enum Player {
    One,
    Two,
}

export enum MultiplayerMode {
    HighScoreBattle,
    AttackMode,
}

type Handler = (game: any) => void;

export interface MultiplayerState {
    winner?: Player | null; // null represents tie game
    gameState: GameState;
    player1: Game;
    player2: Game;
}

// TODO: move subsribe into start, unsub in end
// use players array and get rid of player 1 and player 2 intance var

export class Multiplayer {

    public readonly mode: MultiplayerMode;
    private lastState: string;
    private subscribers: Set<Handler>;
    private eventSubscribers: Map<EventHandler, Event[]>;
    private multiplayerState?: MultiplayerState;
    private player1: Tetris;
    private player2: Tetris;
    private players: Tetris[];

    private refreshLoop?: number;

    private nextPiecesPlayer1: Fill[][][];
    private nextPiecesPlayer2: Fill[][][];

    constructor(mode?: MultiplayerMode) {
        this.nextPiecesPlayer1 = [];
        this.nextPiecesPlayer2 = [];
        this.player1 = new Tetris(this.generatePiecePlayer1);
        this.player2 = new Tetris(this.generatePiecePlayer2);
        this.players = [this.player1, this.player2];
        this.subscribers = new Set<Handler>();
        this.eventSubscribers = new Map<EventHandler, Event[]>();
        this.lastState = JSON.stringify(this.multiplayerState);
        this.updatePlayer1State = this.updatePlayer1State.bind(this);
        this.updatePlayer2State = this.updatePlayer2State.bind(this);
        this.player1.subscribe(this.updatePlayer1State);
        this.player2.subscribe(this.updatePlayer2State);
        this.mode = mode === undefined ? MultiplayerMode.AttackMode : mode;

        if (this.mode === MultiplayerMode.AttackMode) {
            this.player1.subscribeToEvent(this.player2.damage, Event.Attack);
            this.player2.subscribeToEvent(this.player1.damage, Event.Attack);
        }
    }

    public subscribeToEvent(handler: EventHandler, ...events: Event[]) {
        const tempEvents: any[] = events.length === 0 ?
            Object.keys(Event)
            .map((key: any) => Event[key])
            .filter((value) => typeof value === "number") : events;

        const filteredEvents = tempEvents.filter((event) =>
            event !== Event.Start &&
            event !== Event.GameOver &&
            event !== Event.PauseIn &&
            event !== Event.PauseOut);

        // make sure we dont publish duplicate events
        this.player1.subscribeToEvent(handler, ...filteredEvents);
        this.player2.subscribeToEvent(handler, ...filteredEvents);

        this.eventSubscribers.set(handler, tempEvents.filter((event) =>
            event === Event.Start ||
            event === Event.GameOver ||
            event === Event.PauseIn ||
            event === Event.PauseOut));

    }

    public unsubscribeToEvent(handler: EventHandler) {
        this.player1.unsubscribeToEvent(handler);
        this.player2.unsubscribeToEvent(handler);
        this.player1.unsubscribeToEvent(this.player2.damage);
        this.player2.unsubscribeToEvent(this.player1.damage);
        this.eventSubscribers.delete(handler);
    }

    // TODO: refactor to have player 1 and 2 join the game
    // local to make them join and leave
    // online is same but controlled by the human player

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
        // this.setState({
        //     gameState: this.getState().gameState,
        // });

        this.publishEvent(this.getState().gameState === GameState.Paused ? Event.PauseOut : Event.PauseIn);
        this.setState({
            gameState: this.getState().gameState === GameState.Paused ? GameState.Active : GameState.Paused,
        });
    }

    public drop(player: Player, tick: boolean, hardDrop?: boolean): Promise<void> {
        return this.players[player].drop(tick, hardDrop);
    }

    public endGame(player?: Player) {
        if (this.getState().gameState === GameState.GameOver) {
            return;
        }

        if (this.mode === MultiplayerMode.AttackMode) {
            clearInterval(this.refreshLoop);
        }

        if (player !== undefined) {
            this.players[player].endGame();
        } else {
            this.player1.endGame();
            this.player2.endGame();
            this.setState({
                gameState: GameState.GameOver,
                winner: undefined,
            });
            this.publishEvent(Event.GameOver);
        }
    }

    public start() {
        this.restart();
    }

    public restart() {
        this.nextPiecesPlayer1 = [];
        this.nextPiecesPlayer2 = [];
        this.players[Player.One].restart();
        this.players[Player.Two].restart();
        this.initializeState();
        // TODO: add constructor arg to control local vs remote refresh interval
        this.refreshLoop = setInterval(this.notify, 50); // 35
        this.publishEvent(Event.Start);
    }

    public getState(): MultiplayerState {
        return {
            ...(this.multiplayerState || {}),
        } as MultiplayerState;
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
        if (this.mode === MultiplayerMode.AttackMode &&
            player1.gameState === GameState.GameOver &&
            this.player2.getState().gameState !== GameState.GameOver) {
            this.setState({
                player1,
                gameState: GameState.GameOver,
                winner: Player.Two,
            });
            this.publishEvent(Event.GameOver);
            this.player2.endGame();
            this.notify();
            clearInterval(this.refreshLoop);
        } else if (this.mode === MultiplayerMode.HighScoreBattle &&
            player1.gameState === GameState.GameOver &&
            this.player2.getState().gameState === GameState.GameOver) {

            let winner;
            if (this.player1.getState().scoreboard &&
                this.player2.getState().scoreboard) {

                if (this.player1.getState().scoreboard.score === this.player2.getState().scoreboard.score) {
                    winner = null;
                } else if (this.player1.getState().scoreboard.score > this.player2.getState().scoreboard.score) {
                    winner = Player.One;
                } else  {
                    winner = Player.Two;
                }
            }

            this.setState({
                player1,
                gameState: GameState.GameOver,
                winner,
            });
            this.publishEvent(Event.GameOver);
            this.notify();
            clearInterval(this.refreshLoop);
        } else {
            this.setState({
                player1,
            });
        }
    }

    private updatePlayer2State(player2: Game) {
        if (this.mode === MultiplayerMode.AttackMode &&
            player2.gameState === GameState.GameOver &&
            this.player1.getState().gameState !== GameState.GameOver) {
            this.setState({
                player2,
                gameState: GameState.GameOver,
                winner: Player.One,
            });
            this.publishEvent(Event.GameOver);
            this.player1.endGame();
            this.notify();
            clearInterval(this.refreshLoop);
        } else if (player2.gameState === GameState.GameOver &&
            this.mode === MultiplayerMode.HighScoreBattle &&
            this.player1.getState().gameState === GameState.GameOver) {

            let winner;
            if (this.player1.getState().scoreboard &&
                this.player2.getState().scoreboard) {

                if (this.player1.getState().scoreboard.score === this.player2.getState().scoreboard.score) {
                    winner = null;
                } else if (this.player1.getState().scoreboard.score > this.player2.getState().scoreboard.score) {
                    winner = Player.One;
                } else  {
                    winner = Player.Two;
                }
            }

            this.setState({
                player2,
                gameState: GameState.GameOver,
                winner,
            });
            this.publishEvent(Event.GameOver);
            this.notify();
            clearInterval(this.refreshLoop);
        } else {
            this.setState({
                player2,
            });
        }
    }

    private generatePiecePlayer1 = () => {
        if (this.nextPiecesPlayer1.length === 0) {
            this.generatePiece();
        }
        return this.nextPiecesPlayer1.shift()!;
    }

    private generatePiecePlayer2 = () => {
        if (this.nextPiecesPlayer2.length === 0) {
            this.generatePiece();
        }
        return this.nextPiecesPlayer2.shift()!;
    }

    private generatePiece = () => {
        const piece = generateRandomPiece();
        this.nextPiecesPlayer1.push(piece);
        this.nextPiecesPlayer2.push(piece);
    }

    private publishEvent = (event: Event) => {
        this.eventSubscribers.forEach((events, handler) => {
            if (events.length === 0 || events.indexOf(event) >= 0) {
                handler(event);
            }
        });
    }
}
