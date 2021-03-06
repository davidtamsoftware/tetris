import * as Functions from "..";
import { Fill, GameState } from "../../models";
import { Multiplayer } from "../../tetris-core";
import { MultiplayerMode, Player } from "../Multiplayer";
import PlayerActions from "../PlayerActions";

describe("High score battle logic", () => {
    it("should declare the winner when both player's games end", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.HighScoreBattle);
        multiplayer.start();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.player1Actions.drop(true);
            await multiplayer.player2Actions.drop(true);
        }
        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
        expect(multiplayer.getState().winner).toBeNull();

        multiplayer.restart();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);

        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.player1Actions.drop(true);
        }

        await new Promise((res, rej) => setTimeout(res, 2000));
        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.player2Actions.drop(true);
        }

        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
        expect(multiplayer.getState().winner).toBe(Multiplayer.Player.One);

        // run same logic but for other player
        multiplayer.restart();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);

        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.player2Actions.drop(true);
        }

        await new Promise((res, rej) => setTimeout(res, 2000));
        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.player1Actions.drop(true);
        }

        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
        expect(multiplayer.getState().winner).toBe(Multiplayer.Player.Two);
    });

    it("should generate the same sequence of pieces", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.HighScoreBattle);
        multiplayer.start();
        const history = [];
        // simulate that player 1 played faster
        history.push(multiplayer.getState().player1.piece);
        await multiplayer.player1Actions.drop(true);
        history.push(multiplayer.getState().player1.piece);
        await multiplayer.player1Actions.drop(true);
        history.push(multiplayer.getState().player1.piece);
        await multiplayer.player1Actions.drop(true);
        history.push(multiplayer.getState().player1.piece);

        // check that player 2 got the same pieces as player 1 and simulate
        // that player 2 caught up and played faster and got ahead by 2 pieces
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.player2Actions.drop(true);
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.player2Actions.drop(true);
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.player2Actions.drop(true);
        expect(multiplayer.getState().player2.piece).toEqual(history.shift());
        await multiplayer.player2Actions.drop(true);
        history.push(multiplayer.getState().player2.piece);
        await multiplayer.player2Actions.drop(true);
        history.push(multiplayer.getState().player2.piece);

        // check that player 1 got the same pieces as player 2
        await multiplayer.player1Actions.drop(true);
        expect(multiplayer.getState().player1.piece).toEqual(history.shift());
        await multiplayer.player1Actions.drop(true);
        expect(multiplayer.getState().player1.piece).toEqual(history.shift());
    });

    it("should be able to restart the game when game is over", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.HighScoreBattle);
        multiplayer.start();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
        // worst case is 18 pieces to force game over
        // height is 18, smallest piece is 1 row tall
        for (let i = 0; i < 18; i++) {
            await multiplayer.player1Actions.drop(true);
            await multiplayer.player2Actions.drop(true);
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
        await multiplayer.player2Actions.drop(true);
        await multiplayer.player2Actions.drop();
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
        await multiplayer.player1Actions.drop(true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player2.pendingDamage).toBe(1);
    });

    it("should generate pending damage to opponent when you get a tetris", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTetris;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        await setupLine(multiplayer, Player.One, false);
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
        await multiplayer.player1Actions.drop(true);
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
        await multiplayer.player1Actions.drop(true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player1.pendingDamage).toBe(0);
        expect(multiplayer.getState().player2.pendingDamage).toBe(2);
        await multiplayer.player2Actions.drop(true);
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
        await multiplayer.player1Actions.drop(true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player2.pendingDamage).toBe(2);
        await multiplayer.player2Actions.drop(true);
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().player2.pendingDamage).toBe(0);
    });

    it("should declare the winner when the other player's game ends", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        expect(multiplayer.getState().winner).toBeUndefined();
        for (let i = 0; i < 15; i++) {
            await multiplayer.player1Actions.drop(true);
        }
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().winner).toBe(Player.Two);

        // run same logic but for other player
        multiplayer.restart();
        expect(multiplayer.getState().winner).toBeUndefined();
        for (let i = 0; i < 15; i++) {
            await multiplayer.player2Actions.drop(true);
        }
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().winner).toBe(Player.One);
    });

    // it("should generate the same sequence of pieces for both players");

    it("should be able to restart the game when game is over", async () => {
        (Functions.generateRandomPiece as any) = mockGenerateTetris;

        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        expect(multiplayer.getState().winner).toBeUndefined();
        for (let i = 0; i < 15; i++) {
            await multiplayer.player1Actions.drop(true);
        }
        await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
        expect(multiplayer.getState().winner).toBe(Player.Two);
        multiplayer.restart();
        expect(multiplayer.getState().winner).toBeUndefined();
    });

    it("should be able to end an active game", async () => {
        const multiplayer = new Multiplayer.Multiplayer(MultiplayerMode.AttackMode);
        multiplayer.start();
        expect(multiplayer.getState().gameState).toBe(GameState.Active);
        multiplayer.endGame();
        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
        // attempts to end a game that is already game over will not change the state
        multiplayer.endGame();
        expect(multiplayer.getState().gameState).toBe(GameState.GameOver);
    });
});

const setupLine = async (multiplayer: Multiplayer.Multiplayer, player: Player, completeLine: boolean) => {
    const playerActions: PlayerActions =
        player === Player.One ? multiplayer.player1Actions : multiplayer.player2Actions;
    playerActions.moveLeft();
    playerActions.moveLeft();
    playerActions.moveLeft();
    await playerActions.drop(true);

    playerActions.moveLeft();
    playerActions.moveLeft();
    await playerActions.drop(true);

    playerActions.moveLeft();
    await playerActions.drop(true);

    playerActions.moveRight();
    await playerActions.drop(true);

    playerActions.moveRight();
    playerActions.moveRight();
    await playerActions.drop(true);

    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    await playerActions.drop(true);

    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    await playerActions.drop(true);

    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    await playerActions.drop(true);

    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    playerActions.moveRight();
    await playerActions.drop(true);

    if (completeLine) {
        await playerActions.drop(true);
    }
};
