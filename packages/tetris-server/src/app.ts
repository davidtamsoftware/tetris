import express from "express";
import http from "http";
import { Player } from "tetris-core/lib/actions/Multiplayer";
import { Action, ClientMessage, ServerMessage } from "tetris-ws-model";
import WebSocket from "ws";
import { Match, MatchPlayer } from "./Match";
import { matchService } from "./MatchService";

const app = express();

app.use(express.static(__dirname + "/../../tetris/build"));

app.get("/matches", (req, res) => {
    res.send(matchService.matches.map((match) => ({
        matchId: match.matchId,
        count: (match.player1 ? 1 : 0) + (match.player2 ? 1 : 0),
    })));
});

const server = http.createServer(app);
server.listen(process.env.PORT || 8080);

// TODO: port config
const wss = new WebSocket.Server({ server });

let countIncoming = 0;
wss.on("connection", (ws) => {
    const matchPlayer = {
        uid: ws,
        sendState: (state) => sendState(ws, state),
    } as MatchPlayer;

    ws.on("close", () => {
        countIncoming++;
        const match = matchService.findMatch(matchPlayer);
        if (!match) {
            return;
        }
        matchService.playerExit(matchPlayer);
    });

    ws.on("message", (message) => {
        countIncoming++;
        try {
            const msgs = JSON.parse(message.toString()) as ClientMessage[];
            for (const msg of msgs) {
                if (msg.action === Action.Joinmatch && msg.matchId) {
                    const match = matchService.getOrCreate(msg.matchId);
                    match.join(matchPlayer);
                    // tslint:disable-next-line:no-console
                    console.log("player has joined the game");
                } else {
                    const match = matchService.findMatch(matchPlayer);
                    if (!match) {
                        return;
                    }
                    const player = Match.getPlayerNumber(match, matchPlayer);
                    const playerActions = player === Player.One ? match.game.player1Actions : match.game.player2Actions;
                    if (msg.action === Action.MoveLeft) {
                        playerActions.moveLeft();
                    } else if (msg.action === Action.MoveRight) {
                        playerActions.moveRight();
                    } else if (msg.action === Action.RotateLeft) {
                        playerActions.rotateLeft();
                    } else if (msg.action === Action.RotateRight) {
                        playerActions.rotateRight();
                    } else if (msg.action === Action.HardDrop) {
                        playerActions.drop(true);
                    } else if (msg.action === Action.SoftDrop) {
                        playerActions.drop();
                    } else if (msg.action === Action.TogglePause) {
                        match.game.togglePause();
                    } else if (msg.action === Action.Restart
                        && match.player1 && match.player2) {
                        match.game.restart();
                    }
                }
            }
        } catch (error) {
            // tslint:disable-next-line:no-console
            console.log("error", error);
        }
    });
});

// tslint:disable-next-line:no-console
setInterval(() => console.log(
    "active matches: ", matchService.matches.map((match) => ({
        matchId: match.matchId,
        count: (match.player1 ? 1 : 0) + (match.player2 ? 1 : 0),
    })),
), 5000);

let countOutgoing = 0;
setInterval(() => {
    // tslint:disable-next-line:no-console
    console.log("messages sent per 10 seconds: ", countOutgoing);
    // tslint:disable-next-line:no-console
    console.log("messages recieved per 10 seconds: ", countIncoming);
    countOutgoing = 0;
    countIncoming = 0;
}, 10000);

const sendState = (ws: WebSocket, state: ServerMessage) => {
    countOutgoing++;
    ws.send(JSON.stringify(state), (error) => {
        if (error) {
            // tslint:disable-next-line:no-console
            console.log("error sending state");
        }
    });
};
