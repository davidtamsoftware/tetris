import WebSocket from "ws";
import { Multiplayer } from "tetris-core";
import { Action, ClientMessage, ServerMessage, ResponseType } from "tetris-ws-model";
import { Event } from "tetris-core/lib/actions/Tetris";
import express from "express";
import http from "http";

const app = express();
app.use(express.static(__dirname + "/../../tetris/build"));
const server = http.createServer(app);

server.listen(process.env.PORT || 8080);

class MatchService {

    private _matches: Match[];

    constructor() {
        this._matches = [];
    }

    get matches(): Match[] {
        return this._matches
    }

    public findMatch(ws: WebSocket): Match | undefined {
        const results = this._matches.filter((match) => match.player1 === ws || match.player2 === ws);
        if (results.length !== 1) {
            return undefined;
        }
        return results[0];
    }

    public playerExit(player: any) {
        const match = this.findMatch(player);
        if (match) {
            match.quit(player);
            if (!match.player1 && !match.player2) {
                matchService.matches.splice(matchService.matches.indexOf(match));
            }
        }
    }

    public getOrCreate(matchId: string): Match {
        const results = this._matches.filter((match) => match.matchId === matchId);
        if (results.length !== 1 || !results[0]) {
            const match = new Match(matchId);
            this._matches.push(match);
            return match;
        }
        return results[0];
    }

    private purgeOldMatches = () => {
        // TODO: cleanup old matches 
    }
}

class Match {
    private _matchId: string;
    private _game: Multiplayer.Multiplayer;
    private _player1?: any;
    private _player2?: any;
    // TODO add time for when not ready (ie. less than 2 players), used by cleanup process

    public constructor(matchId: string) {
        this._matchId = matchId;
        this._game = new Multiplayer.Multiplayer();
        this._game.subscribe(this.handle);
        // Subscribe to only a subset of the events that are triggered by server
        // game calculation logic. This is to reduce the number of web socket 
        // messages. Events that are triggered by user button action can be
        // captured on the client.
        this._game.subscribeToEvent(this.handleEvent,
            Event.Drop, Event.GameOver, Event.Single,
            Event.Double, Event.Triple, Event.Tetris,
            Event.PauseIn, Event.PauseOut, Event.Start,
            Event.GameOver);
    }

    get game(): Multiplayer.Multiplayer {
        return this._game;
    }

    get matchId(): string {
        return this._matchId;
    }

    get player1(): any {
        return this._player1;
    }

    get player2(): any {
        return this._player2;
    }

    public join(player: any) {
        let joined = false;
        if (!this._player1) {
            this._player1 = player;
            joined = true;
        } else if (!this._player2) {
            this._player2 = player;
            joined = true;
        }

        if (joined && this._player1 && this._player2) {
            console.log("starting game");
            this._game.start();
        }
    }

    public quit(player: any) {
        const playerNumber = Match.getPlayerNumber(this, player);
        console.log("player quit: ", playerNumber);
        playerNumber === Multiplayer.Player.One ? this._player1 = undefined : this._player2 = undefined;
        this._game.endGame(playerNumber);
    }

    private handle = (state: any) => {
        if (this._player1) {
            sendState(this._player1, JSON.stringify({
                type: ResponseType.GameState,
                payload: state,
            } as ServerMessage));
        }
        if (this._player2) {
            sendState(this._player2, JSON.stringify({
                type: ResponseType.GameState,
                payload: state,
            } as ServerMessage));
        }
    }


    private handleEvent = (event: Event) => {
        if (this._player1) {
            sendState(this._player1, JSON.stringify({
                type: ResponseType.GameEvent,
                payload: event,
            } as ServerMessage));
        }
        if (this._player2) {
            sendState(this._player2, JSON.stringify({
                type: ResponseType.GameEvent,
                payload: event,
            } as ServerMessage));
        }
    }

    public static getPlayerNumber = (match: Match, ws: WebSocket): Multiplayer.Player => {
        if (match._player1 === ws) {
            return Multiplayer.Player.One;
        } else if (match._player2 === ws) {
            return Multiplayer.Player.Two;
        }

        throw new Error("player not found");
    };

}

const matchService = new MatchService();

// TODO: port config
const wss = new WebSocket.Server({ server });

const getPlayerNumber = (match: Match, ws: WebSocket): Multiplayer.Player => {
    if (match.player1 === ws) {
        return Multiplayer.Player.One;
    } else if (match.player2 === ws) {
        return Multiplayer.Player.Two;
    }

    throw new Error("player not found");
};

setInterval(() => console.log("active matches: ", matchService.matches.length), 5000);
setInterval(() => {
    console.log("avg messages sent per 10 seconds: ", count);
    count = 0;
}, 10000);

wss.on("connection", (ws, req) => {
    ws.on("close", () => {
        matchService.playerExit(ws);
    });

    ws.on("message", (message) => {
        try {
            const msg = JSON.parse(message.toString()) as ClientMessage;
            if (msg.action === Action.Joinmatch && msg.matchId) {
                const match = matchService.getOrCreate(msg.matchId);
                match.join(ws);
            } else {
                const match = matchService.findMatch(ws);
                if (!match) {
                    return;
                }
                const player = Match.getPlayerNumber(match, ws);
                if (msg.action === Action.MoveLeft) {
                    match.game.moveLeft(player);
                } else if (msg.action === Action.MoveRight) {
                    match.game.moveRight(player);
                } else if (msg.action === Action.RotateLeft) {
                    match.game.rotateLeft(player);
                } else if (msg.action === Action.RotateRight) {
                    match.game.rotateRight(player);
                } else if (msg.action === Action.HardDrop) {
                    match.game.drop(player, false, true);
                } else if (msg.action === Action.SoftDrop) {
                    match.game.drop(player, false, false);
                } else if (msg.action === Action.Restart) {
                    match.game.restart();
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    });
});

let count = 0;
const sendState = (ws: WebSocket, state: string) => {
    count++;
    ws.send(state, (error) => {
        // console.log("sent state");
        if (error) {
            console.log("error sending state");
        }
    });
};
