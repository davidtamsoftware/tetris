import { Fill } from "./Fill";

export type Playfield = Fill[][];

export const generatePlayfield =
    (row: number, col: number) => new Array<number[]>(row).fill(new Array<number>(col).fill(0));

export const playfield: Playfield = generatePlayfield(18, 10);
