export type Piece = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number]
];

// 10W X 18H
export type GameState = [
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number],
    [number, number, number, number, number, number, number, number, number, number]
];

export const o: Piece = [
    [0,0,0,0],
    [0,1,1,0],
    [0,1,1,0],
    [0,0,0,0],
];

export const i = [
    [0,0,0,0],
    [2,2,2,2],
    [0,0,0,0],
    [0,0,0,0],
];

export const s = [
    [0,0,0,0],
    [0,0,3,3],
    [0,3,3,0],
    [0,0,0,0],
];

export const z = [
    [0,0,0,0],
    [0,4,4,0],
    [0,0,4,4],
    [0,0,0,0],
];

export const l = [
    [0,0,0,0],
    [0,5,5,5],
    [0,5,0,0],
    [0,0,0,0],
];

export const j = [
    [0,0,0,0],
    [0,6,6,6],
    [0,0,0,6],
    [0,0,0,0],
];

export const t = [
    [0,0,0,0],
    [0,7,7,7],
    [0,0,7,0],
    [0,0,0,0],
];
