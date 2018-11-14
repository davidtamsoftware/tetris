import { Fill } from "./Fill";

export type Piece = Fill[][];

export const o: Piece = [
    [Fill.Blue, Fill.Blue],
    [Fill.Blue, Fill.Blue],
];

export const i: Piece = [
    [Fill.Blank, Fill.Blank, Fill.Blank, Fill.Blank],
    [Fill.Gray, Fill.Gray, Fill.Gray, Fill.Gray],
    [Fill.Blank, Fill.Blank, Fill.Blank, Fill.Blank],
    [Fill.Blank, Fill.Blank, Fill.Blank, Fill.Blank],
];

export const s: Piece = [
    [Fill.Blank, Fill.Blank, Fill.Blank],
    [Fill.Blank, Fill.Yellow, Fill.Yellow],
    [Fill.Yellow, Fill.Yellow, Fill.Blank],
];

export const z: Piece = [
    [Fill.Blank, Fill.Blank, Fill.Blank],
    [Fill.Orange, Fill.Orange, Fill.Blank],
    [Fill.Blank, Fill.Orange, Fill.Orange],
];

export const l: Piece = [
    [Fill.Blank, Fill.Blank, Fill.Blank],
    [Fill.Green, Fill.Green, Fill.Green],
    [Fill.Green, Fill.Blank, Fill.Blank],
];

export const j: Piece = [
    [Fill.Blank, Fill.Blank, Fill.Blank],
    [Fill.Red, Fill.Red, Fill.Red],
    [Fill.Blank, Fill.Blank, Fill.Red],
];

export const t: Piece = [
    [Fill.Blank, Fill.Blank, Fill.Blank],
    [Fill.Purple, Fill.Purple, Fill.Purple],
    [Fill.Blank, Fill.Purple, Fill.Blank],
];

export const pieces: Piece[] = [o, i, s, z, l, j, t];

export default Piece;
