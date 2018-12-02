export declare enum Action {
    Joinmatch = 0,
    MoveLeft = 1,
    MoveRight = 2,
    SoftDrop = 3,
    HardDrop = 4,
    RotateLeft = 5,
    RotateRight = 6,
    Restart = 7
}
export interface Message {
    action: Action;
    matchId?: string;
}
