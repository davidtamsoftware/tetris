import { Event, Multiplayer } from "tetris-core";
import { MultiplayerMode, MultiplayerState, Player } from "tetris-core/lib/actions/Multiplayer";
import { calcDelta, MatchEvent, MatchState, MultiplayerDeltaState, Payload, ResponseType, ServerMessage } from "tetris-ws-model/lib/tetris-ws-model";

/**
 * Abstraction layer to remote player implementation
 */
export interface MatchPlayer {
    uid: any;
    sendState(state: ServerMessage): void;
    exit(): void;
}

export class Match {
    public static getPlayerNumber = (match: Match, matchPlayer: MatchPlayer): Multiplayer.Player => {
        if (match._player1 && match._player1.uid === matchPlayer.uid) {
            return Multiplayer.Player.One;
        } else if (match._player2 && match._player2.uid === matchPlayer.uid) {
            return Multiplayer.Player.Two;
        }

        throw new Error("player not found");
    }

    private _matchId: string;
    private _game: Multiplayer.Multiplayer;
    private _delayedStart?: NodeJS.Timeout;
    private _delayedStartExecuted: boolean;
    private _player1?: MatchPlayer;
    private _player2?: MatchPlayer;
    private lastState?: MultiplayerState;

    public constructor(matchId: string) {
        this._delayedStartExecuted = false;
        this._matchId = matchId;

        this._game = new Multiplayer.Multiplayer(
            MultiplayerMode.AttackMode,
            process.env.TETRIS_SERVER_REFRESH_INTERVAL && !isNaN(Number(process.env.TETRIS_SERVER_REFRESH_INTERVAL)) ? Number(process.env.TETRIS_SERVER_REFRESH_INTERVAL) : undefined);
        this._game.subscribe(this.handle);
        // Subscribe to only a subset of the events that are triggered by server
        // game calculation logic. This is to reduce the number of web socket
        // messages. Events that are triggered by user button action can be
        // captured on the client.
        this._game.subscribeToEvent(this.handleEvent,
            Event.Drop, Event.GameOver, Event.Single,
            Event.Double, Event.Triple, Event.Tetris,
            Event.Start, Event.GameOver, Event.Damage);
    }

    get game(): Multiplayer.Multiplayer {
        return this._game;
    }

    get matchId(): string {
        return this._matchId;
    }

    get player1(): MatchPlayer | undefined {
        return this._player1;
    }

    get player2(): MatchPlayer | undefined {
        return this._player2;
    }

    public join(player: MatchPlayer): boolean {
        let joined = false;
        if (!this._player1) {
            this._player1 = player;
            joined = true;
        } else if (!this._player2) {
            this._player2 = player;
            joined = true;
        }

        if (joined && this._player1 && this._player2) {
            // tslint:disable-next-line:no-console
            console.log("starting game...");
            // only start game from server if it hasn't already started once
            if (this._game.getState().gameState === undefined) {
                this._delayedStart = setTimeout(() => {
                    this._delayedStartExecuted = true;
                    this._game.start();
                }, 5000);
            } else {
                // this is an existing game since gameState !== undefined
                // send full state to player that joined
                player.sendState({
                    type: ResponseType.GameState,
                    payload: calcDelta({} as any, this._game.getState()) as MultiplayerDeltaState,
                });
            }
        }

        if (joined) {
            const playerCount = (this._player1 ? 1 : 0) + (this._player2 ? 1 : 0);

            if (this._player1) {
                this._player1.sendState({
                    type: ResponseType.MatchState,
                    payload: {
                        playerCount,
                        player: Player.One,
                    } as MatchState,
                });
            }
            if (this._player2) {
                this._player2.sendState({
                    type: ResponseType.MatchState,
                    payload: {
                        playerCount,
                        player: Player.Two,
                    } as MatchState,
                });
            }
        } else {
            player.sendState({
                type: ResponseType.MatchEvent,
                payload: MatchEvent.MATCH_FULL,
            });
            player.exit();
        }

        return joined;
    }

    public quit(player: MatchPlayer) {
        const playerNumber = Match.getPlayerNumber(this, player);
        // tslint:disable-next-line:no-console
        console.log("player quit: ", playerNumber);
        playerNumber === Multiplayer.Player.One ? this._player1 = undefined : this._player2 = undefined;
        if (this._delayedStart) {
            clearTimeout(this._delayedStart);
        }
        if (this._delayedStartExecuted) {
            this._game.endGame(playerNumber);
        }

        this.broadcast(ResponseType.MatchState, {
            playerCount: (this._player1 ? 1 : 0) + (this._player2 ? 1 : 0),
        } as MatchState);
    }

    private handle = (state: MultiplayerState) => {
        // send delta
        const delta = calcDelta(this.lastState || {} as MultiplayerState, state);
        this.lastState = state;
        this.broadcast(ResponseType.GameState, delta);
    }

    private handleEvent = (event: Event) => {
        this.broadcast(ResponseType.GameEvent, event);
    }

    private broadcast = (type: ResponseType, payload: Payload) => {
        if (this._player1) {
            this._player1.sendState({
                type,
                payload,
            });
        }
        if (this._player2) {
            this._player2.sendState({
                type,
                payload,
            });
        }
    }
}
