import { Game, GameState, Playfield, pieces, playfield as initialPlayfield } from "src/models";
import { moveLeft, hasCollision, calculatePosition, generateRandomPiece, rotateLeft, rotateRight, moveRight, moveDown } from ".";

type Handler = (game: Game) => void;

export class Tetris {

    private subscribers: Set<Handler>;
    private game: Game;
    private freezeSemaphore: boolean;
    private loop: NodeJS.Timeout;

    constructor() {
        this.incrementCount = this.incrementCount.bind(this);
        this.addLines = this.addLines.bind(this);
        this.addScore = this.addScore.bind(this);
        this.updateGame = this.updateGame.bind(this);
        this.subscribers = new Set<Handler>();
        this.initializeState();
    }

    public moveLeft() {
        const { position, piece } = moveLeft(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public moveRight() {
        const { position, piece } = moveRight(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public rotateRight() {
        const { position, piece } = rotateRight(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public rotateLeft() {
        const { position, piece } = rotateLeft(this.game.playfield, this.game.position, this.game.piece);
        this.setState({
            position,
            piece,
        });
    }

    public togglePause() {
        this.setState({
            gameState: this.game.gameState === GameState.Paused ? GameState.Active : GameState.Paused,
        });
    }

    public async drop(tick: boolean, hardDrop?: boolean) {
        if (this.game.gameState === GameState.Active && !this.freezeSemaphore) {
            this.freezeSemaphore = true;
            const result = await moveDown(
                this.game.playfield,
                this.game.position,
                this.game.piece,
                this.addScore,
                this.addLines,
                this.updateGame,
                tick,
                hardDrop);

            this.freezeSemaphore = false;

            let nextPiece;
            if (!result.piece) {
                const position = calculatePosition(this.game.playfield, this.game.nextPiece);
                result.piece = this.game.nextPiece;
                result.position = position;
                nextPiece = generateRandomPiece();
                this.incrementCount(result.piece.toString());

                // check if new piece has collision with new playfield, if so then game over
                if (hasCollision(result.playfield, position, result.piece)) {
                    result.gameover = GameState.GameOver;
                    //   localStorage.setItem("highscore", this.game.scoreboard.highscore.toString());
                }
            }

            this.setState({
                ...result,
                nextPiece: nextPiece ? nextPiece : this.game.nextPiece,
                gameState: result.gameover ? GameState.GameOver : GameState.Active,
            });
        }
    }

    public start() {
        this.restart();
    }
    
    public restart() {
        this.tick(1);
        this.setState(this.initializeState());
    }

    public getState() {
        // TODO: deep copy
        return {
            ...this.game,
        }
    }

    public subscribe(handler: Handler) {
        this.subscribers.add(handler);
    }

    public unsubscribe(handler: Handler) {
        this.subscribers.delete(handler);
    }

    private tick(level: number) {
        clearInterval(this.loop);
        this.loop = setInterval(() => this.drop(true), 1000 / level);
    }

    private initializeState() {
        const randomPiece = generateRandomPiece();
        const state = {
            playfield: initialPlayfield,
            piece: randomPiece,
            nextPiece: generateRandomPiece(),
            position: calculatePosition(initialPlayfield, randomPiece),
            gameState: GameState.Active,
            scoreboard: {
                level: 1,
                lines: 0,
                highscore: Number(localStorage.getItem("highscore") || 0),
                score: 0,
            },
            stats: pieces
                .map((item) => ({ [item.toString()]: item === randomPiece ? 1 : 0 }))
                .reduce((acc, item) => ({ ...acc, ...item })),
        };
        this.setState(state);
    }

    private incrementCount(pieceKey: string) {
        const stats = {
            ...this.game.stats,
            [pieceKey]: this.game.stats[pieceKey] + 1
        };

        this.setState({
            stats
        });
    }

    private addScore(score: number) {
        this.setState({
            scoreboard: {
                ...this.game.scoreboard,
                score: this.game.scoreboard.score + score,
            },
        });
    }

    private addLines(lines: number) {
        const pts = [0, 40, 100, 300, 400];

        const level = Math.floor((this.game.scoreboard.lines + lines) / 10) + 1;
        const score = this.game.scoreboard.score + this.game.scoreboard.level * pts[lines];

        if (this.game.scoreboard.level !== level) {
            this.tick(level);
        }

        this.setState({
            scoreboard: {
                ...this.game.scoreboard,
                highscore: this.game.scoreboard.highscore > score ? this.game.scoreboard.highscore : score,
                lines: this.game.scoreboard.lines + lines,
                score,
                level,
            },
        });
    }

    private updateGame(playfield: Playfield) {
        this.setState({
            playfield,
            piece: [],
        })
    }

    private notify() {
        this.subscribers.forEach((subscriber) => subscriber(this.game));
    }

    private setState(state: any) {
        // mutate state
        this.game = {
            ...this.game,
            ...state,
        }

        this.notify();
    }
}