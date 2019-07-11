import { FormEvent, FormEventHandler, useEffect, useRef, useState } from "react";
import { Models, Multiplayer as MultiplayerAction, Tetris } from "tetris-core";
import GameActions from "tetris-core/lib/actions/GameActions";
import { MultiplayerMode, Player } from "tetris-core/lib/actions/Multiplayer";
import PlayerActions from "tetris-core/lib/actions/PlayerActions";
import { HighScoreService } from "tetris-core/lib/actions/Tetris";
import { GameState } from "tetris-core/lib/models";
import { MultiplayerRemoteClient } from "tetris-ws-client";
import { MatchEvent, MatchState } from "tetris-ws-model";
import { MenuHandler } from "../components/Menu";
import { handleEvent, Key } from "../containers/App";

const localStorageHighScoreService: HighScoreService = {
    getHighScore() {
        return Number(localStorage.getItem("highscore") || 0);
    },
    saveHighScore(score: number) {
        localStorage.setItem("highscore", score.toString());
    }
}

interface KeyMapping {
    rotateLeft: string[];
    rotateRight: string[];
    moveLeft: string[];
    moveRight: string[];
    drop: string[];
    hardDrop: string[];
}

const useGameControls = (
    getGameState: () => Models.GameState,
    gameActions: GameActions) => {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (getGameState() === Models.GameState.Active && (event.key === "Escape" || event.key === "Esc")) {
                gameActions.togglePause();
            }
        }

        document.addEventListener("keydown", handler);
        return () => {
            document.removeEventListener("keydown", handler);
        };
    }, []);
}

const usePlayerControls = (
    getGameState: () => Models.GameState,
    playerActions: PlayerActions,
    keyMapping: KeyMapping) => {
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (getGameState() !== Models.GameState.Active) {
                return;
            } else if (keyMapping.rotateLeft.some((value) => value.toLowerCase() === event.key.toLowerCase())) {
                playerActions.rotateLeft();
            } else if (keyMapping.rotateRight.some((value) => value.toLowerCase() === event.key.toLowerCase())) {
                playerActions.rotateRight();
            } else if (keyMapping.moveRight.some((value) => value.toLowerCase() === event.key.toLowerCase())) {
                playerActions.moveRight();
            } else if (keyMapping.moveLeft.some((value) => value.toLowerCase() === event.key.toLowerCase())) {
                playerActions.moveLeft();
            } else if (keyMapping.drop.some((value) => value.toLowerCase() === event.key.toLowerCase())) {
                playerActions.drop();
            } else if (keyMapping.hardDrop.some((value) => value.toLowerCase() === event.key.toLowerCase())) {
                playerActions.drop(true);
            }
        };
        document.addEventListener("keydown", handler);
        return () => {
            document.removeEventListener("keydown", handler);
        };
    }, []);
}

const usePlayer1Controls = (
    getGameState: () => Models.GameState,
    playerActions: PlayerActions) => {
    usePlayerControls(getGameState, playerActions, {
        rotateLeft: ["Shift"],
        rotateRight: ["ArrowUp", "Up"],
        moveRight: ["ArrowRight", "Right"],
        moveLeft: ["ArrowLeft", "Left"],
        drop: ["ArrowDown", "Down"],
        hardDrop: [" ", "Spacebar"],
    });
}

const usePlayer2Controls = (
    getGameState: () => Models.GameState,
    playerActions: PlayerActions) => {
    usePlayerControls(getGameState, playerActions, {
        rotateLeft: ["e"],
        rotateRight: ["r"],
        moveRight: ["f"],
        moveLeft: ["s"],
        drop: ["d"],
        hardDrop: ["a"],
    });
}

const useHandleGameMenuSelect = (gameActions: GameActions, exit?: () => void) => useRef((key: Key) => {
    if (key === "HOME" || key === "QUIT_CONFIRM") {
        gameActions.endGame();
        if (exit) {
            exit();
        }
    } else if (key === "QUIT_CANCEL") {
        return false;
    } else if (key === "RESUME") {
        gameActions.togglePause();
    } else if (key === "RESTART") {
        gameActions.restart();
    }
    return true;
}).current;

const useHandleGameMenuClose = (gameActions: GameActions) => useRef(() => {
    gameActions.togglePause();
    return true;
}).current;

export const useTetris = (exit?: () => void): {
    game: Models.Game,
    handleMenuClose: MenuHandler,
    handleMenuSelect: MenuHandler,
} => {
    const tetris = useRef(new Tetris(undefined, localStorageHighScoreService)).current;
    const [game, setGame] = useState(tetris.getState());

    useEffect(() => {
        tetris.subscribe(setGame);
        tetris.subscribeToEvent(handleEvent);
        tetris.start();
        return () => {
            tetris.unsubscribe(setGame);
            tetris.unsubscribeToEvent(handleEvent);
        }
    }, []);

    useGameControls(() => tetris.getState().gameState, tetris);
    usePlayer1Controls(() => tetris.getState().gameState, tetris);

    const handleMenuSelect = useHandleGameMenuSelect(tetris, exit);
    const handleMenuClose = useHandleGameMenuClose(tetris);

    return { game, handleMenuClose, handleMenuSelect };
}

export const useMultiplayerLocal = (mode: MultiplayerMode, exit?: () => void): {
    game: MultiplayerAction.MultiplayerState,
    handleMenuClose: MenuHandler,
    handleMenuSelect: MenuHandler,
} => {
    const multiplayer = useRef(new MultiplayerAction.Multiplayer(mode)).current;

    const [game, setGame] = useState(multiplayer.getState());

    useEffect(() => {
        multiplayer.subscribe(setGame);
        multiplayer.subscribeToEvent(handleEvent);
        multiplayer.start();
        return () => {
            multiplayer.unsubscribe(setGame);
            multiplayer.unsubscribeToEvent(handleEvent);
        }
    }, []);

    useGameControls(() => multiplayer.getState().gameState, multiplayer);
    usePlayer1Controls(() => multiplayer.getState().gameState, multiplayer.player1Actions);
    usePlayer2Controls(() => multiplayer.getState().gameState, multiplayer.player2Actions);
    const handleMenuSelect = useHandleGameMenuSelect(multiplayer, exit);
    const handleMenuClose = useHandleGameMenuClose(multiplayer);

    return { game, handleMenuClose, handleMenuSelect };
}

interface ClientMatchState {
    matchId?: string;
    matchMenu?: boolean;
    matchEvent?: MatchEvent;
    playerCount: number;
    player?: Player;
    matchMessages: string[];
}

export const useMultiplayerRemote = (exit?: () => void): {
    game: MultiplayerAction.MultiplayerState & ClientMatchState,
    matchIdInput: React.RefObject<HTMLInputElement>,
    handleMenuClose: MenuHandler,
    handleMenuSelect: MenuHandler,
    handleSubmitMatchId: FormEventHandler,
    handleMatchMenuSelect: MenuHandler,
    handleMatchMenuClose: VoidFunction
} => {
    const multiplayer = useRef(new MultiplayerRemoteClient(process.env.REACT_APP_TETRIS_SERVER_URL as any)).current;

    const [game, setGame] = useState<MultiplayerAction.MultiplayerState & ClientMatchState>({
        ...multiplayer.getState(),
        playerCount: 0,
        matchMessages: [],
    });

    const matchIdInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (!game.gameState) {
                if (!game.matchMenu && (event.key === "Escape" || event.key === "Esc")) {
                    setGame((prevState) => ({
                        ...prevState,
                        matchMenu: true
                    }));
                }
                return;
            }
        }

        document.addEventListener("keydown", handler);
        return () => {
            document.removeEventListener("keydown", handler);
        };
    }, []);

    useEffect(() => {
        const handleMatchEvent = (matchEvent: MatchEvent) => {
            setGame((prevState) => ({
                ...prevState,
                matchEvent,
                gameState: game.gameState && matchEvent === MatchEvent.DISCONNECTED ? GameState.GameOver : game.gameState,
            }));
        };

        const handleMatchState = (matchState: MatchState) => {
            // if 2 => 1, player left game
            // if 1 => 2 && gameState === undefined, player has joined the game, starting game
            // if 0 => 2, starting game

            const newMsg: string[] = [];
            if (game.playerCount === 2 && matchState.playerCount === 1) {
                newMsg.push("Player has left the game");
            } else if (game.playerCount === 1 && matchState.playerCount === 2 && game.gameState === undefined) {
                newMsg.push("Player has joined the game");
                newMsg.push("Starting game...");
            } else if (game.playerCount === 1 && matchState.playerCount === 2) {
                newMsg.push("Player has joined the game");
            } else if (game.playerCount === 0 && matchState.playerCount === 2 && game.gameState === undefined) {
                newMsg.push("Starting game...");
            }
            const matchMessages = [...game.matchMessages, ...newMsg];

            setTimeout(() => {
                const clonedMessages = [...game.matchMessages];
                newMsg.forEach(() => clonedMessages.shift());
                setGame((prevState) => ({
                    ...prevState,
                    matchMessages: clonedMessages,
                }));
            }, 5000);

            setGame((prevState) => ({
                ...prevState,
                ...matchState,
                matchMessages,
            }));
        };

        const handle = (multiplayerState: MultiplayerAction.MultiplayerState) => {
            setGame((prevState) => ({
                ...prevState,
                ...multiplayerState,
            }));
        };

        matchIdInput.current!.focus();
        multiplayer.subscribe(handle);
        multiplayer.subscribeToEvent(handleEvent);
        multiplayer.subscribeToMatchEvent(handleMatchEvent);
        multiplayer.subscribeToMatchState(handleMatchState);
        return () => {
            multiplayer.unsubscribe(handle);
            multiplayer.unsubscribeToEvent(handleEvent);
            multiplayer.unsubscribeToMatchEvent(handleMatchEvent);
            multiplayer.unsubscribeToMatchState(handleMatchState);
            if (game.matchId !== undefined) {
                multiplayer.disconnect();
            }
        }
    }, []);

    const handleSubmitMatchId = useRef((event: FormEvent) => {
        event.preventDefault();
        const matchId = matchIdInput.current!.value;
        if (matchId) {
            setGame((prevState) => ({ ...prevState, matchId }));
            multiplayer.join(matchId);
        }
    }).current;

    const handleMatchMenuSelect = useRef((key: Key) => {
        if (key === "QUIT_CONFIRM") {
            if (exit) {
                exit();
            }
        } else if (key === "QUIT_CANCEL") {
            return false;
        }
        return true;
    }).current;

    const handleMatchMenuClose = useRef(() => {
        setGame((prevState) => ({
            ...prevState,
            matchMenu: false,
        }));
    }).current;

    useGameControls(() => multiplayer.getState().gameState, multiplayer);
    usePlayer1Controls(() => multiplayer.getState().gameState, multiplayer);
    const handleMenuSelect = useHandleGameMenuSelect(multiplayer, exit);
    const handleMenuClose = useHandleGameMenuClose(multiplayer);

    return {
        game,
        matchIdInput,
        handleMenuClose,
        handleMenuSelect,
        handleSubmitMatchId,
        handleMatchMenuSelect,
        handleMatchMenuClose,
    };
}
