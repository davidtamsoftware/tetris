import { pieces } from "../models";
import { Playfield, Piece, PiecePosition, Fill } from "../models";

export const rotate = (rotatePiece: (p: Piece) => Piece, playfield: Playfield, position: PiecePosition, p: Piece) => {
    const piece: Piece = rotatePiece(p);

    if (!hasCollision(playfield, position, piece)) {
        return {
            playfield,
            position,
            piece,
        };
    }

    const shiftedPosition = [-1,1,-2,2,-3,3]
        .map((val) => ({ row: position.row, col: position.col + val } as PiecePosition))
        .filter((newPos) => !hasCollision(playfield, newPos, piece));

    if (shiftedPosition.length>0) {
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
    }
};

export const rotateRight = (playfield: Playfield, position: PiecePosition, p: Piece) => {
    const transform = (piece: Piece) => {
        const rotated = p.map((row) => [...row]);
        for (let i=0; i<rotated.length; i++) {
            for (let j=i; j<(rotated[i].length-i); j++) {            
                if (j+1 === rotated[i].length-i) {
                    break;
                }
                const rows = rotated.length;
                const cols = rotated[i].length;    
                const temp = rotated[i][j]; 

                rotated[i][j] = rotated[rows-1-j][i];
                rotated[rows-1-j][i] = rotated[rows-1-i][cols-1-j];
                rotated[rows-1-i][cols-1-j] = rotated[j][cols-1-i];
                rotated[j][cols-1-i] = temp;
            }
        }
        return rotated;
    }
    return rotate(transform as any, playfield, position, p);
};

export const rotateLeft = (playfield: Playfield, position: PiecePosition, p: Piece) => {
    const transform = (piece: Piece) => {
        const rotated = p.map((row) => [...row]);
        for (let i=0; i<rotated.length; i++) {
            for (let j=i; j<(rotated[i].length-i); j++) {            
                if (j+1 === rotated[i].length-i) {
                    break;
                }
                const rows = rotated.length;
                const cols = rotated[i].length;    
                const temp = rotated[i][j]; 
                rotated[i][j] = rotated[j][cols-1-i];
                rotated[j][cols-1-i] = rotated[rows-1-i][cols-1-j];
                rotated[rows-1-i][cols-1-j] = rotated[rows-1-j][i];
                rotated[rows-1-j][i] = temp;
            }
        }
        return rotated;
    }
    return rotate(transform as any, playfield, position, p);
};

export const moveLeft = (playfield: Playfield, position: PiecePosition, piece: Piece) => {
    const newPos = { row: position.row, col: position.col - 1 };
    return {
        playfield,
        position: hasCollision(playfield, newPos, piece) ? position : newPos,
        piece,
    }
}

export const moveRight = (playfield: Playfield, position: PiecePosition, piece: Piece) => {
    const newPos = { row: position.row, col: position.col + 1 };
    return {
        playfield,
        position: hasCollision(playfield, newPos, piece) ? position : newPos,
        piece,
    }
}

export const moveDown = async (playfield: Playfield, position: PiecePosition, piece: Piece,
    addScore: (score: number) => void,
    addLines: (lines: number) => void,
    updateGame: (game: Playfield) => void,
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
    
    addScore(!tick?count:0);

    if (collision) {
        const newState = await removeCompletedLines(merge(playfield, prevPosition, piece).playfield, updateGame);
        const result: any = {
            playfield: newState.playfield,
        }

        addLines(newState.linesRemoved);    
        return result;
    } 

    return {
        playfield,
        position: newPos,
        piece,
    };
}

export const removeCompletedLines = (playfield: Playfield, updateGame: (game: Playfield) => void) => {
    const animateDeletionState1 = playfield.map((row) => row.every((col) => !!col) ? row.map(() => Fill.White) : row) as Playfield;
    const animateDeletionState2 = playfield.map((row) => row.every((col) => !!col) ? row.map(() => Fill.Gray) : row) as Playfield;
    const newState = playfield.filter((row) => !row.every((col) => !!col));
    const padEmptyLines = playfield.length - newState.length;
    if (!!padEmptyLines) {
        const lines = new Array(padEmptyLines);
        lines.fill(new Array(playfield[0].length).fill(0));
        newState.unshift(...lines);
    }

    if (padEmptyLines) {
        updateGame(animateDeletionState1);
        setTimeout(() => updateGame(animateDeletionState2), 50);
        setTimeout(() => updateGame(animateDeletionState1), 100);
        setTimeout(() => updateGame(animateDeletionState2), 150);
        return new Promise<{playfield: Playfield; linesRemoved: number;}>((resolve, reject) => {
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
    
}

export const hasCollision = (playfield: Playfield, position: PiecePosition, piece: Piece) => {

    for (let m=0; m<piece.length; m++) {
        for (let n=0; n<piece[m].length; n++) {
            if (piece[m][n] && (
                    n+position.col < 0 || 
                    n+position.col >= playfield[m].length ||
                    m+position.row >= playfield.length ||
                    (position.row+m >= 0 && playfield[m+position.row][n+position.col]))) {
                return true;
            }
        }
    }
    return false;
}

export const generateRandomPiece = () => {
    return {
        position: {
            row: -1,
            col: 3,
        },
        piece: pieces[Math.floor(Math.random() * pieces.length)],
    }
}

export const merge = (playfield: Playfield, position: PiecePosition, p: Piece): { playfield: Playfield} => {
    const clonedPlayfield = playfield.map((row) => [...row]) as Playfield;
    for (let m=0; m<p.length; m++) {
        for (let n=0; n<p[m].length; n++) {
            if (p[m][n] && position.row+m >= 0) {
                clonedPlayfield[m+position.row][n+position.col] = p[m][n];
            }
        }
    }
    
    return {
        playfield: clonedPlayfield,
    }
}
