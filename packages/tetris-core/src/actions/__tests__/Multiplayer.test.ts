import { GameState } from "../../models";
import { Multiplayer } from "../../tetris-core";
import { MultiplayerMode, Player } from "../Multiplayer";

describe("High score battle logic", () => {
    it("should declare the winner when both player's games end", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.HighScoreBattle);
        multiplayer.start();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.drop(Multiplayer.Player.One, true);
            await multiplayer.drop(Multiplayer.Player.Two, true);
        }
        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
        expect(multiplayer.getState().winner).toBeNull();

        multiplayer.restart();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);

        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.drop(Multiplayer.Player.One, true);
        }

        await new Promise((res, rej) => setTimeout(res, 2000));
        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.drop(Multiplayer.Player.Two, true);
        }

        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
        expect(multiplayer.getState().winner).toBe(Multiplayer.Player.One);
    });

    it("should generate the same sequence of pieces", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.HighScoreBattle);
        multiplayer.start();
        const history = [];
        // simulate that player 1 played faster
        history.push(multiplayer.getState().player1.piece);
        await multiplayer.drop(Multiplayer.Player.One, true);
        history.push(multiplayer.getState().player1.piece);
        await multiplayer.drop(Multiplayer.Player.One, true);
        history.push(multiplayer.getState().player1.piece);
        await multiplayer.drop(Multiplayer.Player.One, true);
        history.push(multiplayer.getState().player1.piece);

        // check that player 2 got the same pieces as player 1 and simulate
        // that player 2 caught up and played faster and got ahead by 2 pieces
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.drop(Multiplayer.Player.Two, true);
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.drop(Multiplayer.Player.Two, true);
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.drop(Multiplayer.Player.Two, true);
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.drop(Multiplayer.Player.Two, true);
        history.push(multiplayer.getState().player2.piece);
        await multiplayer.drop(Multiplayer.Player.Two, true);
        history.push(multiplayer.getState().player2.piece);

        // check that player 1 got the same pieces as player 2
        await multiplayer.drop(Multiplayer.Player.One, true);
        expect(multiplayer.getState().player1.piece).toEqual(history.shift());
        await multiplayer.drop(Multiplayer.Player.One, true);
        expect(multiplayer.getState().player1.piece).toEqual(history.shift());
    });

    it("should be able to restart the game when game is over", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.HighScoreBattle);
        multiplayer.start();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.drop(Multiplayer.Player.One, true);
            await multiplayer.drop(Multiplayer.Player.Two, true);
        }
        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
        expect(multiplayer.getState().winner).toBeNull();

        multiplayer.restart();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
        expect(multiplayer.getState().player1.playfield.filter((line) => line.every((cell) => !!cell))).toEqual([]);
        expect(multiplayer.getState().player2.playfield.filter((line) => line.every((cell) => !!cell))).toEqual([]);
    });

    it("should be able to pause/unpause the game", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.HighScoreBattle);
        multiplayer.start();
        await multiplayer.drop(Player.Two, true);
        await multiplayer.drop(Player.Two);
        await new Promise((res, rej) => setTimeout(res, 100));
        const prevPlayer1Piece = multiplayer.getState().player1.piece;
        const prevPlayer1Position = multiplayer.getState().player1.position;
        const prevPlayer2Piece = multiplayer.getState().player2.piece;
        const prevPlayer2Position = multiplayer.getState().player2.position;
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
        multiplayer.togglePause();
        expect(multiplayer.getState().gameState).toBe(GameState.Paused);
        await new Promise((res, rej) => setTimeout(res, 2000));
        expect(prevPlayer1Piece).toEqual(multiplayer.getState().player1.piece);
        expect(prevPlayer1Position).toEqual(multiplayer.getState().player1.position);
        expect(prevPlayer2Piece).toEqual(multiplayer.getState().player2.piece);
        expect(prevPlayer2Position).toEqual(multiplayer.getState().player2.position);
        multiplayer.togglePause();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
    });
});

xdescribe("Attack mode logic", () => {
    it("should generate pending damage to opponent when you get a triple");
    it("should generate pending damage to opponent when you get a tetris");
    it("should cancel your pending damage when you get a triple");
    it("should cancel your pending damage when you get a tetris");
    it("should pending damage to damage lines when current piece completes drop");
    it("should declare the winner another player's game ends");
    it("should generate the same sequence of pieces");
    it("should be able to restart the game when game is over");
});
