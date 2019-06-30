interface PlayerActions {
    rotateLeft(): void;
    rotateRight(): void;
    moveRight(): void;
    moveLeft(): void;
    drop(hardDrop?: boolean): void;
}

export default PlayerActions;
