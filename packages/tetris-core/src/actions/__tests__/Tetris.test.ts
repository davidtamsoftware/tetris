import { Fill, GameState } from "../../models";
import { Tetris } from "../Tetris";

jest.setTimeout(5000);

describe("Game logic", () => {
    it("should move current piece down automatically", (done) => {
        expect.assertions(2);
        const tetris = new Tetris();
        tetris.start();
        const beforePosition = tetris.getState().position;
        setTimeout(() => {
            expect(beforePosition.col).toBe(tetris.getState().position.col);
            expect(beforePosition.row).toBeLessThan(tetris.getState().position.row);
            done();
        }, 2000);
    });

    it("should remove lines when there is a completed line after current piece completes drop", async () => {
        const pieceGenerator = () => [[Fill.Blue]];
        const tetris = new Tetris(pieceGenerator);
        tetris.start();
        tetris.moveLeft();
        tetris.moveLeft();
        tetris.moveLeft();
        tetris.moveLeft();
        tetris.moveLeft();
        await tetris.drop(true);

        tetris.moveLeft();
        tetris.moveLeft();
        tetris.moveLeft();
        tetris.moveLeft();
        await tetris.drop(true);

        tetris.moveLeft();
        tetris.moveLeft();
        tetris.moveLeft();
        await tetris.drop(true);

        tetris.moveLeft();
        tetris.moveLeft();
        await tetris.drop(true);

        tetris.moveLeft();
        await tetris.drop(true);

        tetris.moveRight();
        await tetris.drop(true);

        tetris.moveRight();
        tetris.moveRight();
        await tetris.drop(true);

        tetris.moveRight();
        tetris.moveRight();
        tetris.moveRight();
        await tetris.drop(true);

        tetris.moveRight();
        tetris.moveRight();
        tetris.moveRight();
        tetris.moveRight();
        await tetris.drop(true);

        expect(tetris.getState().scoreboard.lines).toBe(0);

        // drop the final block to complete the line
        await tetris.drop(true);

        expect(tetris.getState().scoreboard.lines).toBe(1);
    });

    it("should level up every 10 lines removed", async () => {
        const pieceGenerator = () => [[Fill.Blue]];
        const tetris = new Tetris(pieceGenerator);
        tetris.start();
        for (let i = 0; i < 10; i++) {
            await completeLine(tetris);
            if (i === 0) {
                expect(tetris.getState().scoreboard.lines).toBe(1);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 1) {
                expect(tetris.getState().scoreboard.lines).toBe(2);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 2) {
                expect(tetris.getState().scoreboard.lines).toBe(3);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 3) {
                expect(tetris.getState().scoreboard.lines).toBe(4);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 4) {
                expect(tetris.getState().scoreboard.lines).toBe(5);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 5) {
                expect(tetris.getState().scoreboard.lines).toBe(6);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 6) {
                expect(tetris.getState().scoreboard.lines).toBe(7);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 7) {
                expect(tetris.getState().scoreboard.lines).toBe(8);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 8) {
                expect(tetris.getState().scoreboard.lines).toBe(9);
                expect(tetris.getState().scoreboard.level).toBe(1);
            } else if (i === 9) {
                expect(tetris.getState().scoreboard.lines).toBe(10);
                expect(tetris.getState().scoreboard.level).toBe(2);
            }
        }
    });

    it("should rotate current piece left when there is space", () => {
        const pieceGenerator = () => [[Fill.Blue, Fill.Blank], [Fill.Blank, Fill.Blank]];
        const tetris = new Tetris(pieceGenerator);
        tetris.start();
        tetris.rotateLeft();
        expect(tetris.getState().piece).toEqual([[Fill.Blank, Fill.Blank], [Fill.Blue, Fill.Blank]]);
    });

    it("should rotate current piece right when there is space", () => {
        const pieceGenerator = () => [[Fill.Blue, Fill.Blank], [Fill.Blank, Fill.Blank]];
        const tetris = new Tetris(pieceGenerator);
        tetris.start();
        tetris.rotateRight();
        expect(tetris.getState().piece).toEqual([[Fill.Blank, Fill.Blue], [Fill.Blank, Fill.Blank]]);
    });

    // xit("should be unable to rotate left when there is no space");
    // xit("should be unable to rotate right when there is no space");

    it("should generate a new piece when current piece completes drop", async () => {
        let i = 0;
        const pieceGenerator = () => {
            i++;
            if (i === 1) {
                return [[Fill.Green]];
            } else if (i === 2) {
                return [[Fill.Orange]];
            } else if (i === 3) {
                return [[Fill.Blue]];
            } else {
                return [[Fill.Gray]];
            }
        };
        const tetris = new Tetris(pieceGenerator);
        tetris.start();
        expect(tetris.getState().piece).toEqual([[Fill.Green]]);
        expect(tetris.getState().nextPiece).toEqual([[Fill.Orange]]);
        await tetris.drop(true);
        expect(tetris.getState().piece).toEqual([[Fill.Orange]]);
        expect(tetris.getState().nextPiece).toEqual([[Fill.Blue]]);
    });

    // xit("should be able to hard drop a piece");
    // xit("should be able to soft drop a piece");

    it("should end the game when there is an immediate collision from a newly generated piece", async () => {
        const tetris = new Tetris();
        tetris.start();
        expect(tetris.getState().gameState).toBe(GameState.Active);
        // more than 10 pieces dropped without manuever should be sufficient to end the game
        for (let i = 0; i < 15; i++) {
            await tetris.drop(true);
        }
        expect(tetris.getState().gameState).toBe(GameState.GameOver);
    });

    it("should be able to pause an active game", async () => {
        const tetris = new Tetris();
        tetris.start();
        expect(tetris.getState().gameState).toBe(GameState.Active);
        await tetris.drop(true);
        expect(tetris.getState().gameState).toBe(GameState.Active);
        tetris.togglePause();
        expect(tetris.getState().gameState).toBe(GameState.Paused);
        const prevPosition = tetris.getState().position;
        const prevPiece = tetris.getState().piece;
        await new Promise((res, rej) => setTimeout(res, 2000));
        expect(prevPosition).toEqual(tetris.getState().position);
        expect(prevPiece).toEqual(tetris.getState().piece);
        tetris.togglePause();
        expect(tetris.getState().gameState).toBe(GameState.Active);
        await new Promise((res, rej) => setTimeout(res, 2000));
        expect(prevPosition).not.toEqual(tetris.getState().position);
    });

    it("should be able to restart the game after game over", async () => {
        const tetris = new Tetris();
        tetris.start();
        expect(tetris.getState().gameState).toBe(GameState.Active);
        // more than 10 pieces dropped without manuever should be sufficient to end the game
        for (let i = 0; i < 15; i++) {
            await tetris.drop(true);
        }
        expect(tetris.getState().gameState).toBe(GameState.GameOver);
        tetris.restart();
        expect(tetris.getState().gameState).toBe(GameState.Active);
        expect(tetris.getState().playfield.filter((line) => line.every((cell) => !!cell))).toEqual([]);
    });
});

xdescribe("Scoreboard", () => {
    it("should track the number of lines removed");
    it("should track the number of each pieces used");
    it("should track the score");
    it("should track the high score");
});

const completeLine = async (tetris: Tetris) => {
    tetris.moveLeft();
    tetris.moveLeft();
    tetris.moveLeft();
    tetris.moveLeft();
    tetris.moveLeft();
    await tetris.drop(true);

    tetris.moveLeft();
    tetris.moveLeft();
    tetris.moveLeft();
    tetris.moveLeft();
    await tetris.drop(true);

    tetris.moveLeft();
    tetris.moveLeft();
    tetris.moveLeft();
    await tetris.drop(true);

    tetris.moveLeft();
    tetris.moveLeft();
    await tetris.drop(true);

    tetris.moveLeft();
    await tetris.drop(true);

    tetris.moveRight();
    await tetris.drop(true);

    tetris.moveRight();
    tetris.moveRight();
    await tetris.drop(true);

    tetris.moveRight();
    tetris.moveRight();
    tetris.moveRight();
    await tetris.drop(true);

    tetris.moveRight();
    tetris.moveRight();
    tetris.moveRight();
    tetris.moveRight();
    await tetris.drop(true);

    await tetris.drop(true);
};
