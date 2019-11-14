import { Event, Multiplayer } from "tetris-core";
import { MultiplayerState } from "tetris-core/lib/actions/Multiplayer";

export enum Action {
    Joinmatch,
    MoveLeft,
    MoveRight,
    SoftDrop,
    HardDrop,
    RotateLeft,
    RotateRight,
    Restart,
    TogglePause,
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
    player: Multiplayer.Player;
}

export interface ClientMessage {
    action: Action;
    matchId?: string;
}

export type Payload = Event | MultiplayerState | MatchState | MatchEvent;

export interface ServerMessage {
    type: ResponseType;
    payload: Payload;
}
