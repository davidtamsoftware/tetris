import { Player } from "./Multiplayer";

interface GameActions {
    endGame(player?: Player): void;
    start(): void;
    restart(): void;
    togglePause(): void;
}

export default GameActions;
