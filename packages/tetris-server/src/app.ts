import WebSocket from "ws";
import { Multiplayer } from "tetris-core";

class MatchService {

    private matches: Match2[];
    
    constructor() {
        this.matches = [];
    }

    public findMatch(ws: WebSocket): Match2 | undefined {
        const results = this.matches.filter((match) => match.player1 === ws || match.player2 === ws);
        if (results.length !==  1) {
            return undefined;
        }
        return results[0];
    }

    public getOrCreate(matchId: string): Match2 {
        const results = this.matches.filter((match) => match.matchId === matchId);    
        if (results.length !== 1 || !results[0]) {
            const match = new Match2(matchId);
            this.matches.push(match);
            return match;
        }
        return results[0];
    }

    private purgeOldMatches = () => {
        // cleanup old matches 
    }
}

class Match2 {
    private _matchId: string;
    private _game: Multiplayer.Multiplayer;
    private _player1?: WebSocket;
    private _player2?: WebSocket;
    // TODO add time for when not ready (ie. less than 2 players)

    public constructor(matchId: string) {
        this._matchId = matchId;
        this._game = new Multiplayer.Multiplayer();
        this._game.subscribe(this.handle);
    }

    get game(): Multiplayer.Multiplayer {
        return this._game;
    }

    get matchId(): string {
        return this._matchId;
    }

    get player1(): WebSocket | undefined {
        return this._player1;
    }

    get player2(): WebSocket | undefined {
        return this._player2;
    }

    public join(ws: WebSocket) {
        let joined = false;
        if (!this._player1) {
            this._player1 = ws;
            joined = true;
        } else if (!this._player2) {
            this._player2 = ws;
            joined = true;
        }

        if (joined && this._player1 && this._player2) {
            console.log("starting game");
            this._game.start();
        } 
    }

    public quit(ws: WebSocket) {
        const player = Match2.getPlayerNumber(this, ws);
        player === Player.One ? this._player1 = undefined : this._player2 = undefined;
        this._game.endGame(player);
    }

    private handle = (state: any) => {
        if (this._player1) {
            sendState(this._player1, JSON.stringify(state));
        }
        if (this._player2) {
            sendState(this._player2, JSON.stringify(state));
        }
    }

    public static getPlayerNumber = (match: Match2, ws: WebSocket): Player => {
        if (match._player1 === ws) {
            return Player.One;
        } else if (match._player2 === ws) {
            return Player.Two;
        }
    
        throw new Error("player not found");
    };
    
}

const matchService = new MatchService();

interface Match {
    matchId: string;
    game: Multiplayer.Multiplayer;
    player1?: WebSocket;
    player2?: WebSocket;
}

interface Matches {
    [matchId: string]: Match;
}
const matchs: Matches = {};

const wsTomatch: Map<WebSocket, Match> = new Map();

enum Action {
    Joinmatch,
    MoveLeft,
    MoveRight,
    SoftDrop,
    HardDrop,
    RotateLeft,
    RotateRight,
    Restart,
}

interface Message {
    action: Action;
    matchId?: string;
}

export enum Player {
    One,
    Two,
};

const wss = new WebSocket.Server({ port: 8080 });

const getPlayerNumber = (match: Match, ws: WebSocket): Player => {
    if (match.player1 === ws) {
        return Player.One;
    } else if (match.player2 === ws) {
        return Player.Two;
    }

    throw new Error("player not found");
};

wss.on("connection", (ws, req) => {
    ws.on("close", () => {
        const match = matchService.findMatch(ws);
        if (match) {
            match.quit(ws);
        }
    });

    ws.on("message", (message) => {
        console.log(matchs);
        try {
            const msg = JSON.parse(message.toString()) as Message;
            if (msg.action === Action.Joinmatch && msg.matchId) {
                const match = matchService.getOrCreate(msg.matchId);
                match.join(ws);
            } else {
                const match = matchService.findMatch(ws);
                if (!match) {
                    return;
                }
                const player = Match2.getPlayerNumber(match, ws);
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


const sendState = (ws: WebSocket, state: string) => {
    ws.send(state, (error) => {
        console.log("sent state");
        if (error) {
            console.log("error sending state");
        }
    });
};
