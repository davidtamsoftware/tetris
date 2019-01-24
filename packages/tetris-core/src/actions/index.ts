import { pieces } from "../models";
import { Fill, Piece, PiecePosition, Playfield } from "../models";
import { Event } from "./Tetris";

export const rotate = (rotatePiece: (p: Piece) => Piece, playfield: Playfield, position: PiecePosition, p: Piece) => {
    const piece: Piece = rotatePiece(p);

    if (!hasCollision(playfield, position, piece)) {
        return {
            playfield,
            position,
            piece,
        };
    }

    // this will shift the piece over if rotation doesn't immediately fit
    // similar auto move left/right and rotate
    const shiftedPosition = [-1, 1, -2, 2, -3, 3]
        .map((val) => ({ row: position.row, col: position.col + val } as PiecePosition))
        .filter((newPos) => !hasCollision(playfield, newPos, piece));

    if (shiftedPosition.length > 0) {
        return {
            playfield,
            position: shiftedPosition[0],
            piece,
        };
    }

    return {
        playfield,
        position,
        piece: p,
    };
};

export const rotateRight = (playfield: Playfield, position: PiecePosition, p: Piece) => {
    const transform = (piece: Piece) => {
        const rotated = p.map((row) => [...row]);
        for (let i = 0; i < rotated.length; i++) {
            for (let j = i; j < (rotated[i].length - i); j++) {
                if (j + 1 === rotated[i].length - i) {
                    break;
                }
                const rows = rotated.length;
                const cols = rotated[i].length;
                const temp = rotated[i][j];

                rotated[i][j] = rotated[rows - 1 - j][i];
                rotated[rows - 1 - j][i] = rotated[rows - 1 - i][cols - 1 - j];
                rotated[rows - 1 - i][cols - 1 - j] = rotated[j][cols - 1 - i];
                rotated[j][cols - 1 - i] = temp;
            }
        }
        return rotated;
    };
    return rotate(transform as any, playfield, position, p);
};

export const rotateLeft = (playfield: Playfield, position: PiecePosition, p: Piece) => {
    const transform = (piece: Piece) => {
        const rotated = p.map((row) => [...row]);
        for (let i = 0; i < rotated.length; i++) {
            for (let j = i; j < (rotated[i].length - i); j++) {
                if (j + 1 === rotated[i].length - i) {
                    break;
                }
                const rows = rotated.length;
                const cols = rotated[i].length;
                const temp = rotated[i][j];
                rotated[i][j] = rotated[j][cols - 1 - i];
                rotated[j][cols - 1 - i] = rotated[rows - 1 - i][cols - 1 - j];
                rotated[rows - 1 - i][cols - 1 - j] = rotated[rows - 1 - j][i];
                rotated[rows - 1 - j][i] = temp;
            }
        }
        return rotated;
    };
    return rotate(transform as any, playfield, position, p);
};

export const moveLeft = (playfield: Playfield, position: PiecePosition, piece: Piece) => {
    const newPos = { row: position.row, col: position.col - 1 };
    return {
        playfield,
        position: hasCollision(playfield, newPos, piece) ? position : newPos,
        piece,
    };
};

export const moveRight = (playfield: Playfield, position: PiecePosition, piece: Piece) => {
    const newPos = { row: position.row, col: position.col + 1 };
    return {
        playfield,
        position: hasCollision(playfield, newPos, piece) ? position : newPos,
        piece,
    };
};

export const moveDown = async (
    playfield: Playfield,
    position: PiecePosition,
    piece: Piece,
    addScore: (score: number) => void,
    addLines: (lines: number) => void,
    updateGame: (game: Playfield) => void,
    publishEvent: (event: Event) => void,
    tick: boolean,
    hardDrop?: boolean) => {

    let collision;
    let newPos = { ...position };
    let prevPosition;
    let count = 0;
    do {
        count++;
        prevPosition = { row: newPos.row, col: newPos.col };
        newPos = { row: prevPosition.row + 1, col: prevPosition.col };
        collision = hasCollision(playfield, newPos, piece);
    } while (hardDrop && !collision);

    addScore(!tick ? count : 0);

    if (collision) {
        const newState = await removeCompletedLines(
            merge(playfield, prevPosition, piece).playfield, updateGame, publishEvent);
        const result: any = {
            playfield: newState.playfield,
        };

        addLines(newState.linesRemoved);
        return result;
    }

    return {
        playfield,
        position: newPos,
        piece,
    };
};

export const removeCompletedLines =
    (playfield: Playfield, updateGame: (game: Playfield) => void, publishEvent: (event: Event) => void) => {
        const animateDeletionState1 =
            playfield.map((row) => row.every((col) => !!col) ? row.map(() => Fill.White) : row) as Playfield;
        const animateDeletionState2 =
            playfield.map((row) => row.every((col) => !!col) ? row.map(() => Fill.Gray) : row) as Playfield;
        const newState = playfield.filter((row) => !row.every((col) => !!col));
        const padEmptyLines = playfield.length - newState.length;
        if (!!padEmptyLines) {
            const lines = new Array(padEmptyLines);
            lines.fill(new Array(playfield[0].length).fill(0));
            newState.unshift(...lines);
        }

        publishEvent(Event.Drop);
        if (padEmptyLines) {
            switch (padEmptyLines) {
                case 1:
                    publishEvent(Event.Single);
                    break;
                case 2:
                    publishEvent(Event.Double);
                    break;
                case 3:
                    publishEvent(Event.Triple);
                    break;
                case 4:
                    publishEvent(Event.Tetris);
                    break;
            }
            updateGame(animateDeletionState1);
            setTimeout(() => updateGame(animateDeletionState2), 50);
            setTimeout(() => updateGame(animateDeletionState1), 100);
            setTimeout(() => updateGame(animateDeletionState2), 150);
            return new Promise<{ playfield: Playfield; linesRemoved: number; }>((resolve, reject) => {
                setTimeout(() => resolve({
                    playfield: newState,
                    linesRemoved: padEmptyLines,
                } as any), 200);
            });
        }

        return Promise.resolve({
            playfield: newState,
            linesRemoved: padEmptyLines,
        });
    };

export const hasCollision = (playfield: Playfield, position: PiecePosition, piece: Piece) => {

    for (let m = 0; m < piece.length; m++) {
        for (let n = 0; n < piece[m].length; n++) {
            if (piece[m][n] && (
                n + position.col < 0 ||
                n + position.col >= playfield[m].length ||
                m + position.row >= playfield.length ||
                // collision with playfield
                (position.row + m >= 0 && playfield[m + position.row][n + position.col]))) {
                return true;
            }
        }
    }
    return false;
};

export const generateRandomPiece = () => pieces[Math.floor(Math.random() * pieces.length)];

// calculates starting position for a new piece within the playfield
export const calculatePosition = (playfield: Playfield, piece: Piece) => ({
    row: 0 - piece.findIndex((row) => !row.every((col) => col === Fill.Blank)),
    col: Math.floor(playfield[0].length / 2) - Math.floor(piece[0].length / 2),
});

export const merge = (playfield: Playfield, position: PiecePosition, p: Piece): { playfield: Playfield } => {
    const clonedPlayfield = playfield.map((row) => [...row]) as Playfield;
    for (let m = 0; m < p.length; m++) {
        for (let n = 0; n < p[m].length; n++) {
            if (p[m][n] && position.row + m >= 0) {
                clonedPlayfield[m + position.row][n + position.col] = p[m][n];
            }
        }
    }

    return {
        playfield: clonedPlayfield,
    };
};

export const appendRandomLines = (playfield: Playfield, count: number, updateGame: (game: Playfield) => void) => {
    if (!count) {
        return;
    }

    const clonedPlayfield = playfield.map((row) => [...row]) as Playfield;
    for (let i = 0; i < count; i++) {
        clonedPlayfield.shift();
    }
    const lines = [];
    for (let row = 0; row < count; row++) {
        const line = [];
        // tslint:disable-next-line:prefer-for-of
        for (let col = 0; col < playfield[0].length; col++) {
            line.push(Math.round(Math.random()));
        }
        lines.push(line);
    }

    const animateState1 = clonedPlayfield
        .concat(new Array(count).fill(new Array(playfield[0].length).fill(Fill.White)));
    const animateState2 = clonedPlayfield
        .concat(new Array(count).fill(new Array(playfield[0].length).fill(Fill.Gray)));

    updateGame(animateState1);
    setTimeout(() => updateGame(animateState2), 50);
    setTimeout(() => updateGame(animateState1), 100);
    setTimeout(() => updateGame(animateState2), 150);

    // TODO: ensure that there is at least 1 zero and at least 1 non-zero
    const result = clonedPlayfield.concat(lines);

    return new Promise<Playfield>((resolve) => {
        setTimeout(() => resolve(result), 200);
    });
};
