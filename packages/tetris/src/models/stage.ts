import * as pieces from "./pieces";
import { GameState as State, Piece } from "./pieces";
import { number } from 'prop-types';

export interface PositionGrid {
    row: number,
    col: number,
}

export const rotate = (rotatePiece: (p: Piece) => Piece, state: State, position: PositionGrid, p: Piece) => {
    // rotate
    // check for collision
    // return result if no collision
    // if collision move left 1
    // check for collision
    // return result if no collision
    // if collision move right 1
    // check for collision
    // return result if no collision
    // else return same result as args

    const piece: Piece = rotatePiece(p);

    if (!hasCollision(state, position, piece)) {
        return {
            state,
            position,
            piece,
        };
    }

    const shiftedPosition = [-1,1,-2,2,-3,3]
        .map((val) => ({ row: position.row, col: position.col + val } as PositionGrid))
        .filter((newPos) => !hasCollision(state, newPos, piece));

    if (shiftedPosition.length>0) {
        return {
            state,
            position: shiftedPosition[0],
            piece,
        };
    }

    return {
        state,
        position,
        piece: p,
    }
};

export const rotateRight = (state: State, position: PositionGrid, p: Piece) => {
    return rotate((piece: Piece) => ([
        [p[3][0], p[2][0], p[1][0], p[0][0]],
        [p[3][1], p[2][1], p[1][1], p[0][1]],
        [p[3][2], p[2][2], p[1][2], p[0][2]],
        [p[3][3], p[2][3], p[1][3], p[0][3]],
    ]), state, position, p);
};

export const rotateLeft = (state: State, position: PositionGrid, p: Piece) => {
    return rotate((piece: Piece) => ([
        [p[0][3], p[1][3], p[2][3], p[3][3]],
        [p[0][2], p[1][2], p[2][2], p[3][2]],
        [p[0][1], p[1][1], p[2][1], p[3][1]],
        [p[0][0], p[1][0], p[2][0], p[3][0]],
    ]), state, position, p);
};

export const moveLeft = (state: State, position: PositionGrid, piece: Piece) => {
    // calc position
    // check for collision
    // return result if no collision
    // else return same result

    const newPos = { row: position.row, col: position.col - 1 };
    return {
        state,
        position: hasCollision(state, newPos, piece) ? position : newPos,
        piece,
    }
}

export const moveRight = (state: State, position: PositionGrid, piece: Piece) => {
    // calc position
    // check for collision
    // return result if no collision
    // else return same result
    
    const newPos = { row: position.row, col: position.col + 1 };
    return {
        state,
        position: hasCollision(state, newPos, piece) ? position : newPos,
        piece,
    }
}

export const moveDown = async (state: State, position: PositionGrid, piece: Piece, 
    incrementCounter: (pieceKey: string) => void,
    addScore: (score: number) => void,
    addLines: (lines: number) => void,
    updateGame: (game: pieces.GameState) => void) => {

    // TODO: *** add lines from remove completed lines action
    // add score based on the removed lines
    // update the handler for keypress down to add score
    // increase the tick speed when score increases.
    // add tick speed to initial state so that we can update the state to control tick speed



    // calc position
    // check for collision
    // return result if no collision
    // else return merged state + piece and generate a random piece and reset position
    
    const newPos = { row: position.row + 1, col: position.col };
    const collision = hasCollision(state, newPos, piece);

    if (collision) {
        const newState = await removeCompletedLines(merge(state, position, piece).state as State, updateGame);
        const result: any = {
            state: newState.state,
            ...generateRandomPiece(),
            gameover: false,
        }
        
        addLines(newState.linesRemoved);
        incrementCounter(result.piece.toString());

        // check if new piece has collision with new state, if so then game over
        if (!hasCollision(result.state, result.position, result.piece)) {
            return result;
        } else {
            return {
                state,
                position,
                piece,
                gameover: true,
            };
        };
    } 

    return {
        state,
        position: newPos,
        piece,
        gameover: false,
    };
}

export const removeCompletedLines = (state: State, updateGame: (game: pieces.GameState) => void) => {
    const animateDeletionState = state.map((row) => row.every((col) => !!col) ? row.map((col) => 8) : row);
    const newState = state.filter((row) => !row.every((col) => !!col));
    const padEmptyLines = state.length - newState.length;
    if (!!padEmptyLines) {
        const lines = new Array(padEmptyLines);
        lines.fill(new Array(state[0].length).fill(0));
        newState.unshift(...lines);
    }

    if (padEmptyLines) {
        updateGame(animateDeletionState as pieces.GameState);
        return new Promise<{state: pieces.GameState; linesRemoved: number;}>((resolve, reject) => {
            setTimeout(() => resolve({
                state: newState,
                linesRemoved: padEmptyLines,
            } as any), 100);
        });
    }

    return Promise.resolve({
        state: newState,
        linesRemoved: padEmptyLines,
    });
    
}

export const hasCollision = (state: State, position: PositionGrid, piece: Piece) => {
    for (let m=0; m<4; m++) {
        for (let n=0; n<4; n++) {
            if (piece[m][n] && (
                    n+position.col < 0 || 
                    n+position.col >= state[m].length ||
                    m+position.row >= state.length ||
                    (position.row+m >= 0 && state[m+position.row][n+position.col]))) {
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
        piece: mapOfPieces[Math.round(Math.random() * 6)],
    }
}

export const merge = (state: State, position: PositionGrid, p: Piece): { state: State} => {
    const clonedState = state.map((row) => [...row]) as State;
    for (let m=0; m<4; m++) {
        for (let n=0; n<4; n++) {
            if (p[m][n] && position.row+m >= 0) {
                clonedState[m+position.row][n+position.col] = p[m][n];
            }
        }
    }
    
    return {
        state: clonedState,
    }
}
