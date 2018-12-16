export declare enum Action {
    Joinmatch = 0,
    MoveLeft = 1,
    MoveRight = 2,
    SoftDrop = 3,
    HardDrop = 4,
    RotateLeft = 5,
    RotateRight = 6,
    Restart = 7,
    InstantMessage = 8
}
export interface ClientMessage {
    action: Action;
    matchId?: string;
}
