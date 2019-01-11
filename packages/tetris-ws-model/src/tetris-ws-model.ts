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

export enum ResponseType {
    GameState,
    GameEvent,
}

export interface ClientMessage {
    action: Action;
    matchId?: string;
}

export interface ServerMessage {
    type: ResponseType;
    payload: any;
}
