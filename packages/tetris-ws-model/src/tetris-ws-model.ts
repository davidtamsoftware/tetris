export enum Action {
    Joinmatch,
    MoveLeft,
    MoveRight,
    SoftDrop,
    HardDrop,
    RotateLeft,
    RotateRight,
    Restart,
    InstantMessage,
}

export interface ClientMessage {
    action: Action;
    matchId?: string;
}

// main server
// game server
// no match id
// create a game and invite
