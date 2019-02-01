import * as Functions from "..";
import { Fill, GameState } from "../../models";
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

describe("Attack mode logic", () => {
    const mockGenerateTriple = jest.fn(() => [
        [Fill.Blue, Fill.Blank, Fill.Blank, Fill.Blank],
        [Fill.Blue, Fill.Blank, Fill.Blank, Fill.Blank],
        [Fill.Blue, Fill.Blank, Fill.Blank, Fill.Blank],
        [Fill.Blank, Fill.Blank, Fill.Blank, Fill.Blank]]);

    const mockGenerateTetris = jest.fn(() => [
        [Fill.Blue, Fill.Blank, Fill.Blank, Fill.Blank],
        [Fill.Blue, Fill.Blank, Fill.Blank, Fill.Blank],
        [Fill.Blue, Fill.Blank, Fill.Blank, Fill.Blank],
        [Fill.Blue, Fill.Blank, Fill.Blank, Fill.Blank]]);

    beforeEach(() => {
        mockGenerateTriple.mockClear();
        mockGenerateTetris.mockClear();
    });

    it("should generate pending damage to opponent when you get a triple", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTriple;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        await setupLine(multiplayer, Player.One, false);
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
        await multiplayer.drop(Player.One, true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        // expect(mockGenerateTriple).toBeCalledTimes(10);
        expect(multiplayer.getState().player2.pendingDamage).toBe(1);
    });

    it("should generate pending damage to opponent when you get a tetris", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTetris;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        await setupLine(multiplayer, Player.One, false);
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
        await multiplayer.drop(Player.One, true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player2.pendingDamage).toBe(2);
    });

    it("should cancel your pending damage when you generate damage for opponent", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTetris;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        await setupLine(multiplayer, Player.One, false);
        await setupLine(multiplayer, Player.Two, false);
        expect(multiplayer.getState().player1.pendingDamage).toBe(0);
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
        await multiplayer.drop(Player.One, true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player1.pendingDamage).toBe(0);
        expect(multiplayer.getState().player2.pendingDamage).toBe(2);
        await multiplayer.drop(Player.Two, true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player1.pendingDamage).toBe(0);
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
    });

    it("should convert pending damage to damage lines when current piece completes drop", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTetris;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        await setupLine(multiplayer, Player.One, false);
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
        await multiplayer.drop(Player.One, true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player2.pendingDamage).toBe(2);
        await multiplayer.drop(Player.Two, true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
    });

    it("should declare the winner when the other player's game ends", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTetris;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        expect(multiplayer.getState().winner).toBeUndefined();
        for (let i = 0; i < 15; i++) {
            await multiplayer.drop(Player.One, true);
        }
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().winner).toBe(Player.Two);
    });

    // it("should generate the same sequence of pieces for both players");

    it("should be able to restart the game when game is over", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTetris;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        expect(multiplayer.getState().winner).toBeUndefined();
        for (let i = 0; i < 15; i++) {
            await multiplayer.drop(Player.One, true);
        }
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().winner).toBe(Player.Two);
        multiplayer.restart();
        expect(multiplayer.getState().winner).toBeUndefined();
    });
});

const setupLine = async (multiplayer: Multiplayer.Multiplayer, player: Player, completeLine: boolean) => {
    multiplayer.moveLeft(player);
    multiplayer.moveLeft(player);
    multiplayer.moveLeft(player);
    await multiplayer.drop(player, true);

    multiplayer.moveLeft(player);
    multiplayer.moveLeft(player);
    await multiplayer.drop(player, true);

    multiplayer.moveLeft(player);
    await multiplayer.drop(player, true);

    multiplayer.moveRight(player);
    await multiplayer.drop(player, true);

    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    await multiplayer.drop(player, true);

    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    await multiplayer.drop(player, true);

    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    await multiplayer.drop(player, true);

    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    await multiplayer.drop(player, true);

    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    multiplayer.moveRight(player);
    await multiplayer.drop(player, true);

    if (completeLine) {
        await multiplayer.drop(player, true);
    }
};
