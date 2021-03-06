import { generateRandomPiece } from ".";
import { Game, GameState, Piece } from "../models";
import GameActions from "./GameActions";
import PlayerActions from "./PlayerActions";
import { Event, EventHandler, Tetris } from "./Tetris";

export enum Player {
    One,
    Two,
}

export enum MultiplayerMode {
    HighScoreBattle,
    AttackMode,
}

export type Handler = (game: MultiplayerState) => void;

export interface MultiplayerState {
    winner?: Player | null; // null represents tie game
    gameState: GameState;
    player1: Game;
    player2: Game;
}

export class Multiplayer implements GameActions {
    public readonly player1Actions: PlayerActions;
    public readonly player2Actions: PlayerActions;

    public readonly mode: MultiplayerMode;
    private lastState: string;
    private subscribers: Set<Handler>;
    private eventSubscribers: Map<EventHandler, Event[]>;
    private multiplayerState?: MultiplayerState;
    private player1: Tetris;
    private player2: Tetris;
    private players: Tetris[];

    private refreshLoop: any; // setInterval

    private nextPiecesPlayer1: Piece[];
    private nextPiecesPlayer2: Piece[];

    constructor(mode?: MultiplayerMode, private refreshInterval = 25) {
        this.nextPiecesPlayer1 = [];
        this.nextPiecesPlayer2 = [];
        this.player1 = new Tetris(() => this.generatePiece(Player.One));
        this.player2 = new Tetris(() => this.generatePiece(Player.Two));
        this.players = [this.player1, this.player2];
        this.subscribers = new Set<Handler>();
        this.eventSubscribers = new Map<EventHandler, Event[]>();
        this.lastState = JSON.stringify(this.multiplayerState);
        this.player1.subscribe((game) => this.updatePlayer(game, Player.One));
        this.player2.subscribe((game) => this.updatePlayer(game, Player.Two));
        this.mode = mode === undefined ? MultiplayerMode.AttackMode : mode;

        if (this.mode === MultiplayerMode.AttackMode) {
            this.player1.subscribeToEvent(this.player2.damage, Event.Attack);
            this.player2.subscribeToEvent(this.player1.damage, Event.Attack);
        }

        this.player1Actions = {
            drop: this.player1.drop.bind(this.player1),
            moveLeft: this.player1.moveLeft.bind(this.player1),
            moveRight: this.player1.moveRight.bind(this.player1),
            rotateLeft: this.player1.rotateLeft.bind(this.player1),
            rotateRight: this.player1.rotateRight.bind(this.player1),
        };

        this.player2Actions = {
            drop: this.player2.drop.bind(this.player2),
            moveLeft: this.player2.moveLeft.bind(this.player2),
            moveRight: this.player2.moveRight.bind(this.player2),
            rotateLeft: this.player2.rotateLeft.bind(this.player2),
            rotateRight: this.player2.rotateRight.bind(this.player2),
        };
    }

    public subscribeToEvent(handler: EventHandler, ...events: Event[]) {
        // subscribe to all events if events arg is 0 in length
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
        // player1 and player2 have game event for start, gameover, pausein
        // and pauseout but we don't want to use these since Multiplayer
        // orchestrates the true game event (when both player1/2 is game over,
        // then multiplayer is game over)
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

    public togglePause() {
        this.players[Player.One].togglePause();
        this.players[Player.Two].togglePause();

        this.publishEvent(this.getState().gameState === GameState.Paused ? Event.PauseOut : Event.PauseIn);
        this.setState({
            gameState: this.getState().gameState === GameState.Paused ? GameState.Active : GameState.Paused,
        });
    }

    public endGame(player?: Player) {
        if (player !== undefined) {
            this.players[player].endGame();
            if (this.mode === MultiplayerMode.AttackMode &&
                (this.player1.getState().gameState === GameState.GameOver ||
                    this.player2.getState().gameState === GameState.GameOver) &&
                this.player1.getState().gameState !== this.player2.getState().gameState) {

                const winner = this.player1.getState().gameState === GameState.GameOver ? Player.Two : Player.One;
                this.players[winner].endGame();
                this.setState({
                    gameState: GameState.GameOver,
                    winner,
                });
                this.publishEvent(Event.GameOver);
                this.notify();
                clearInterval(this.refreshLoop);
            } else if (this.mode === MultiplayerMode.HighScoreBattle &&
                this.player1.getState().gameState === GameState.GameOver &&
                this.player2.getState().gameState === GameState.GameOver) {

                const winner = this.getWinner(this.player1.getState(), this.player2.getState());

                this.setState({
                    gameState: GameState.GameOver,
                    winner,
                });
                this.publishEvent(Event.GameOver);
                this.notify();
                clearInterval(this.refreshLoop);
            }
        } else {
            if (this.getState().gameState === GameState.GameOver) {
                return;
            }

            if (this.mode === MultiplayerMode.AttackMode) {
                clearInterval(this.refreshLoop);
            }
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
        this.refreshLoop = setInterval(this.notify, this.refreshInterval);
        this.publishEvent(Event.Start);
    }

    public getState(): MultiplayerState {
        // deep copy
        return JSON.parse(JSON.stringify(this.multiplayerState || {}));
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
        this.subscribers.forEach((subscriber) => subscriber(this.multiplayerState!));
        this.lastState = JSON.stringify(this.multiplayerState);
    }

    private setState(state: any) {
        this.multiplayerState = {
            ...this.multiplayerState,
            ...state,
        };
    }

    private updatePlayer = (game: Game, player: Player) => {
        const state = {} as any;
        state[player === Player.One ? "player1" : "player2"] = game;
        this.setState({
            ...state,
        });

        if (game.gameState === GameState.GameOver) {
            this.endGame(player);
        }
    }

    private getWinner(player1: Game, player2: Game) {
        if (player1.gameState !== GameState.GameOver ||
            player2.gameState !== GameState.GameOver) {
            throw new Error("Game is still active");
        }
        let winner;
        if (player1.scoreboard && player2.scoreboard) {
            if (player1.scoreboard.score === player2.scoreboard.score) {
                winner = null;
            } else if (player1.scoreboard.score > player2.scoreboard.score) {
                winner = Player.One;
            } else {
                winner = Player.Two;
            }
        }
        return winner;
    }

    private generatePiece = (player: Player) => {
        const nextPieces = player === Player.One ? this.nextPiecesPlayer1 : this.nextPiecesPlayer2;
        if (nextPieces.length === 0) {
            const piece = generateRandomPiece();
            this.nextPiecesPlayer1.push(piece);
            this.nextPiecesPlayer2.push(piece);
        }
        return nextPieces.shift()!;
    }

    private publishEvent = (event: Event) => {
        this.eventSubscribers.forEach((events, handler) => {
            if (events.length === 0 || events.indexOf(event) >= 0) {
                handler(event);
            }
        });
    }
}
