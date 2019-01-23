import WebSocket from "ws";
import { Action, ClientMessage, ServerMessage } from "tetris-ws-model";
import express from "express";
import http from "http";
import { matchService } from "./MatchService";
import { Match, MatchPlayer } from "./Match";

const app = express();

app.use(express.static(__dirname + "/../../tetris/build"));

app.get("/matches", (req, res) => {
    res.send(matchService.matches.map((match) => ({
        matchId: match.matchId,
        count: (match.player1 ? 1 : 0) + (match.player2 ? 1 : 0),
    })));
})

const server = http.createServer(app);
server.listen(process.env.PORT || 8080);

// TODO: port config
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
    const matchPlayer = {
        uid: ws,
        sendState: (state) => sendState(ws, state),
    } as MatchPlayer;
    
    ws.on("close", () => {
        const match = matchService.findMatch(matchPlayer);
        if (!match) {
            return;
        }
        matchService.playerExit(matchPlayer);
    });

    ws.on("message", (message) => {
        try {
            const msg = JSON.parse(message.toString()) as ClientMessage;
            if (msg.action === Action.Joinmatch && msg.matchId) {
                const match = matchService.getOrCreate(msg.matchId);
                match.join(matchPlayer);
                console.log("player has joined the game");
            } else {
                const match = matchService.findMatch(matchPlayer);
                if (!match) {
                    return;
                }
                const player = Match.getPlayerNumber(match, matchPlayer);
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
                } else if (msg.action === Action.Restart
                    && match.player1 && match.player2) {
                    match.game.restart();
                }
            }
        } catch (error) {
            console.log("error", error);
        }
    });
});

setInterval(() => console.log(
    "active matches: ", matchService.matches.map((match) => ({
        matchId: match.matchId,
        count: (match.player1 ? 1 : 0) + (match.player2 ? 1 : 0),
    }))
), 5000);

let count = 0;
setInterval(() => {
    console.log("avg messages sent per 10 seconds: ", count);
    count = 0;
}, 10000);

const sendState = (ws: WebSocket, state: ServerMessage) => {
    count++;
    ws.send(JSON.stringify(state), (error) => {
        if (error) {
            console.log("error sending state");
        }
    });
};
