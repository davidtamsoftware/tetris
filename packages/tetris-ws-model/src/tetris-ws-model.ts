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
    MatchEvent,
}

export enum MatchEvent {
    PLAYER_JOIN,
    PLAYER_EXIT,
    MATCH_FULL,
    DISCONNECTED,
}

export interface ClientMessage {
    action: Action;
    matchId?: string;
}

export interface ServerMessage {
    type: ResponseType;
    payload: any;
}
