import { number } from 'prop-types';

// 10W X 18H
export type PlayField = number[][];

export const generatePlayField = (row: number, col: number) => new Array<number[]>(row).fill(new Array<number>(col).fill(0));

export const playField: PlayField = generatePlayField(18, 30);
