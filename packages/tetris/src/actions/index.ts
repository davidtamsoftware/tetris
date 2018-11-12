import * as pieces from "../models";
import { PlayField, Piece, PiecePosition, Fill } from "../models";

export const rotate = (rotatePiece: (p: Piece) => Piece, playField: PlayField, position: PiecePosition, p: Piece) => {
    const piece: Piece = rotatePiece(p);

    if (!hasCollision(playField, position, piece)) {
        return {
            playField,
            position,
            piece,
        };
    }

    const shiftedPosition = [-1,1,-2,2,-3,3]
        .map((val) => ({ row: position.row, col: position.col + val } as PiecePosition))
        .filter((newPos) => !hasCollision(playField, newPos, piece));

    if (shiftedPosition.length>0) {
        return {
            playField,
            position: shiftedPosition[0],
            piece,
        };
    }

    return {
        playField,
        position,
        piece: p,
    }
};

export const rotateRight = (playField: PlayField, position: PiecePosition, p: Piece) => {
    return rotate((piece: Piece) => ([
        [p[3][0], p[2][0], p[1][0], p[0][0]],
        [p[3][1], p[2][1], p[1][1], p[0][1]],
        [p[3][2], p[2][2], p[1][2], p[0][2]],
        [p[3][3], p[2][3], p[1][3], p[0][3]],
    ]), playField, position, p);
};

export const rotateLeft = (playField: PlayField, position: PiecePosition, p: Piece) => {
    return rotate((piece: Piece) => ([
        [p[0][3], p[1][3], p[2][3], p[3][3]],
        [p[0][2], p[1][2], p[2][2], p[3][2]],
        [p[0][1], p[1][1], p[2][1], p[3][1]],
        [p[0][0], p[1][0], p[2][0], p[3][0]],
    ]), playField, position, p);
};

export const moveLeft = (playField: PlayField, position: PiecePosition, piece: Piece) => {
    const newPos = { row: position.row, col: position.col - 1 };
    return {
        playField,
        position: hasCollision(playField, newPos, piece) ? position : newPos,
        piece,
    }
}

export const moveRight = (playField: PlayField, position: PiecePosition, piece: Piece) => {
    const newPos = { row: position.row, col: position.col + 1 };
    return {
        playField,
        position: hasCollision(playField, newPos, piece) ? position : newPos,
        piece,
    }
}

export const moveDown = async (playField: PlayField, position: PiecePosition, piece: Piece,
    addScore: (score: number) => void,
    addLines: (lines: number) => void,
    updateGame: (game: PlayField) => void,
    hardDrop?: boolean) => {
    
    let collision;
    let newPos = { ...position };
    let prevPosition;
    do {
        prevPosition = { row: newPos.row, col: newPos.col };
        newPos = { row: prevPosition.row + 1, col: prevPosition.col };
        collision = hasCollision(playField, newPos, piece);
    } while (hardDrop && !collision);

    if (collision) {
        const newState = await removeCompletedLines(merge(playField, prevPosition, piece).playField, updateGame);
        const result: any = {
            playField: newState.playField,
        }
        
        addLines(newState.linesRemoved);

        return result;
    } 

    return {
        playField,
        position: newPos,
        piece,
    };
}

export const removeCompletedLines = (playField: PlayField, updateGame: (game: PlayField) => void) => {
    const animateDeletionState1 = playField.map((row) => row.every((col) => !!col) ? row.map(() => Fill.White) : row) as PlayField;
    const animateDeletionState2 = playField.map((row) => row.every((col) => !!col) ? row.map(() => Fill.Gray) : row) as PlayField;
    const newState = playField.filter((row) => !row.every((col) => !!col));
    const padEmptyLines = playField.length - newState.length;
    if (!!padEmptyLines) {
        const lines = new Array(padEmptyLines);
        lines.fill(new Array(playField[0].length).fill(0));
        newState.unshift(...lines);
    }

    if (padEmptyLines) {
        updateGame(animateDeletionState1);
        setTimeout(() => updateGame(animateDeletionState2), 50);
        setTimeout(() => updateGame(animateDeletionState1), 100);
        setTimeout(() => updateGame(animateDeletionState2), 150);
        return new Promise<{playField: PlayField; linesRemoved: number;}>((resolve, reject) => {
            setTimeout(() => resolve({
                playField: newState,
                linesRemoved: padEmptyLines,
            } as any), 200);
        });
    }

    return Promise.resolve({
        playField: newState,
        linesRemoved: padEmptyLines,
    });
    
}

export const hasCollision = (playField: PlayField, position: PiecePosition, piece: Piece) => {

    for (let m=0; m<4; m++) {
        for (let n=0; n<4; n++) {
            if (piece[m][n] && (
                    n+position.col < 0 || 
                    n+position.col >= playField[m].length ||
                    m+position.row >= playField.length ||
                    (position.row+m >= 0 && playField[m+position.row][n+position.col]))) {
                return true;
            }
        }
    }
    return false;
}

export const generateRandomPiece = () => {
    const mapOfPieces = {
        0: pieces.i,
        1: pieces.j,
        2: pieces.l,
        3: pieces.o,
        4: pieces.s,
        5: pieces.t,
        6: pieces.z,
    };
    
    return {
        position: {
            row: -1,
            col: 3,
        },
        piece: mapOfPieces[Math.floor(Math.random() * 7)],
    }
}

export const merge = (playField: PlayField, position: PiecePosition, p: Piece): { playField: PlayField} => {
    const clonedPlayField = playField.map((row) => [...row]) as PlayField;
    for (let m=0; m<4; m++) {
        for (let n=0; n<4; n++) {
            if (p[m][n] && position.row+m >= 0) {
                clonedPlayField[m+position.row][n+position.col] = p[m][n];
            }
        }
    }
    
    return {
        playField: clonedPlayField,
    }
}
