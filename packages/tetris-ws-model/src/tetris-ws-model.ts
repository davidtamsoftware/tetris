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
    MatchState,
    MatchEvent,
}

export enum MatchEvent {
    MATCH_FULL,
    DISCONNECTED,
}

export interface MatchState {
    playerCount: number;
}

export interface ClientMessage {
    action: Action;
    matchId?: string;
}

export interface ServerMessage {
    type: ResponseType;
    payload: any;
}
