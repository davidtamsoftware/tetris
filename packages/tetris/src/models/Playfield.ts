export type Playfield = number[][];

export const generatePlayfield = (row: number, col: number) => new Array<number[]>(row).fill(new Array<number>(col).fill(0));

export const playfield: Playfield = generatePlayfield(18, 10);

export default Playfield;