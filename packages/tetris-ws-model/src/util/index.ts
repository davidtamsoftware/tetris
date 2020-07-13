import { diff } from "deep-object-diff";
import extend from "extend";
import { MultiplayerState } from "tetris-core/lib/actions/Multiplayer";

// tslint:disable-next-line:no-empty-interface
export interface MultiplayerDeltaState {
    [key: string]: any;
    // empty interface used solely for intellisense purpose to type dynamic delta state
    // this schema is controlled by a 3rd party and is not to be constructed manually
    // based on the diff library used, the contract will look like MultiplayerState with optional attributes
}

export const calcDelta = (from: MultiplayerState, to: MultiplayerState): MultiplayerDeltaState => {
    const delta = diff(from, to) as MultiplayerDeltaState;
    // diff library converts array into map object
    // Object.assign and extend lib is not able to properly merge source array to map
    // the selected diff library doesn't have a way to apply delta, but it has the smallest delta footprint
    // work around is to send full array value if a diff is detected

    if (delta && delta.player1 && delta.player1.nextPiece) {
        delta.player1.nextPiece = to.player1.nextPiece;
    }
    if (delta && delta.player1 && delta.player1.piece) {
        delta.player1.piece = to.player1.piece;
    }
    if (delta && delta.player1 && delta.player1.playfield) {
        delta.player1.playfield = to.player1.playfield;
    }

    if (delta && delta.player2 && delta.player2.nextPiece) {
        delta.player2.nextPiece = to.player2.nextPiece;
    }
    if (delta && delta.player2 && delta.player2.piece) {
        delta.player2.piece = to.player2.piece;
    }
    if (delta && delta.player2 && delta.player2.playfield) {
        delta.player2.playfield = to.player2.playfield;
    }
    return delta;
};

export const applyDelta = (original: MultiplayerState, delta: MultiplayerDeltaState): MultiplayerState => {
    // reset needed because piece is not always the same dimensions
    // some are 3x3 and 4x4. extend can potentially merge a 4x4 and 3x3 instead of overwriting it.
    const resets = {
        player1: {},
        player2: {},
    } as any;

    if (delta && delta.player1 && delta.player1.nextPiece) {
        resets.player1.nextPiece = null;
    }
    if (delta && delta.player1 && delta.player1.piece) {
        resets.player1.piece = null;
    }

    if (delta && delta.player2 && delta.player2.nextPiece) {
        resets.player2.nextPiece = null;
    }
    if (delta && delta.player2 && delta.player2.piece) {
        resets.player2.piece = null;
    }

    const state = extend(true, original, resets, delta);

    // need to reset the winner after each game
    if (delta.winner === undefined) {
        delete state.winner;
    }
    return state;
};
