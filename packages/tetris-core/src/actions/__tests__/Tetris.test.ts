import { Fill } from "../../models";
import { Tetris } from "../Tetris";

jest.setTimeout(3000);

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

    // xit("should rotate current piece left when there is space");
    // xit("should rotate current piece right when there is space");
    // xit("should be unable to rotate left when there is no space");
    // xit("should be unable to rotate right when there is no space");
    // xit("should generate a new piece when current piece completes drop");
    // xit("should be able to hard drop a piece");
    // xit("should end the game when there is an immediate collision from a newly generated piece");
    // xit("should be able to restart the game after game over");
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
