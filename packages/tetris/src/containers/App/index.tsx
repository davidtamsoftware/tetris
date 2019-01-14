import * as React from "react";
import Menu from "../../components/Menu";
import MultiplayerLocal from "../Multiplayer/Local";
import MultiplayerRemote from "../Multiplayer/Remote";
import SinglePlayer from "../SinglePlayer";
import { Event } from "tetris-core";
import { MultiplayerMode } from "tetris-core/lib/actions/Multiplayer";
// import linkedinLogo from "./In-2C-21px-R.png";

interface State {
    gameMode?: Key;
};

export interface Props {
    exit?: any;
}

class App extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
        };
    };

    public render() {
        let game;
        if (!this.state.gameMode) {
            game = <div>
                <div style={{ textAlign: "center", margin: "0 auto", border: "0px solid white" }}>
                    <span style={{
                        fontSize: "5em",
                        textShadow: "3px 3px gray"
                    }}>TETRIS</span>
                </div>
                <div style={{ clear: "both", paddingTop: "60px" }}>
                    <Menu menu={mainMenu} notify={this.handle} />
                </div>
                <div style={{ textAlign: "center", paddingTop: "100px" }}>
                    <div style={{ paddingBottom: "15px" }}>Implemented by David Tam</div>
                    <div style={{ fontFamily: "sans-serif" }}>
                        {/* <a href="#"><img src={linkedinLogo} /></a> */}
                        {/* <a href="#">linkedin</a>&#09; */}
                        {/* <a className="github-button" href="https://github.com/davidtamsoftware" aria-label="Follow @davidtamsoftware on GitHub">Follow @davidtamsoftware</a> */}
                        {/* GitHub <a href="#">@davidtamsoftware</a> */}
                    </div>
                </div>
            </div>;
        } else if (this.state.gameMode === "SINGLE_PLAYER") {
            game = <SinglePlayer exit={this.returnToMain} />;
        } else if (this.state.gameMode === "MULTIPLAYER_LOCAL_HIGH_SCORE_BATTLE") {
            game = <MultiplayerLocal exit={this.returnToMain} mode={MultiplayerMode.HighScoreBattle} />;
        } else if (this.state.gameMode === "MULTIPLAYER_LOCAL_ATTACK_MODE") {
            game = <MultiplayerLocal exit={this.returnToMain} mode={MultiplayerMode.AttackMode}/>;
        } else if (this.state.gameMode === "MULTIPLAYER_REMOTE") {
            game = <MultiplayerRemote exit={this.returnToMain} />;
        }

        return <div>
            {game}
        </div>
    }

    private handle = (key: string) => {
        this.setState({
            gameMode: key as any,
        });
    };

    private returnToMain = () => {
        this.setState({
            gameMode: undefined,
        });
    }
}

export const pauseMenu: Node = {
    name: "Paused",
    children: [
        {
            name: "Resume",
            key: "RESUME"
        },
        {
            name: "Quit",
            children: [
                {
                    name: "OK",
                    key: "QUIT_CONFIRM"
                },
                {
                    name: "Cancel",
                    key: "QUIT_CANCEL"
                }
            ]
        }]
};

export const gameOverMenu: Node = {
    name: "Game Over",
    children: [{
        name: "Restart",
        key: "RESTART"
    },
    {
        name: "Home",
        key: "HOME",
    }]
};

// TODO add match over?

export const matchMenu: Node = {
    name: "Exit to Main Menu",
    children: [{
        name: "OK",
        key: "QUIT_CONFIRM"
    },
    {
        name: "Cancel",
        key: "QUIT_CANCEL",
    }]
};


export type Key = "HOME" | "RESTART" | "RESUME" | "QUIT_CONFIRM" | "QUIT_CANCEL" | "SINGLE_PLAYER" |
    "MULTIPLAYER_LOCAL" | "MULTIPLAYER_REMOTE" | "MULTIPLAYER_LOCAL_HIGH_SCORE_BATTLE" | "MULTIPLAYER_LOCAL_ATTACK_MODE" |
    "MULTIPLAYER_REMOTE_HIGH_SCORE_BATTLE" | "MULTIPLAYER_REMOTE_ATTACK_MODE";

interface Node {
    name: string;
    key?: Key;
    children?: Node[];
}

const mainMenu: Node = {
    name: "Main Menu",
    children: [
        {
            name: "Single Player",
            key: "SINGLE_PLAYER",
        },
        {
            name: "Multiplayer",
            children: [
                {
                    name: "Local",
                    children: [
                        {
                            name: "High Score Battle",
                            key: "MULTIPLAYER_LOCAL_HIGH_SCORE_BATTLE",
                        },
                        {
                            name: "Attack Mode",
                            key: "MULTIPLAYER_LOCAL_ATTACK_MODE"
                        }
                    ]
                },
                {
                    name: "Remote",
                    key: "MULTIPLAYER_REMOTE"
                }
            ]
        }
    ]
};

const theme = new Audio("/tetris_theme.mp3");
theme.loop = true;

export const handleEvent = (event: Event) => {
    if (event === Event.Drop) {
        const audio = new Audio("/drop.mp3");
        audio.play();
    } else if (event === Event.Single) {
        const audio = new Audio("/single.mp3");
        audio.play();
    } else if (event === Event.Double) {
        const audio = new Audio("/single.mp3");
        audio.play();
    } else if (event === Event.Triple) {
        const audio = new Audio("/single.mp3");
        audio.play();
    } else if (event === Event.Tetris) {
        const audio = new Audio("/single.mp3");
        audio.play();
    } else if (event === Event.Damage) {
        const audio = new Audio("/damage.mp3");
        audio.play();
    } else if (event === Event.Start) {
        theme.currentTime = 0;
        theme.play();
    } else if (event === Event.GameOver) {
        const audio = new Audio("/gameover.mp3");
        audio.play();
        theme.pause();
    } else if (event === Event.RotateLeft) {
        const audio = new Audio("/rotate_left.mp3");
        audio.play();
    } else if (event === Event.RotateRight) {
        const audio = new Audio("/rotate_right.mp3");
        audio.play();
    } else if (event === Event.PauseIn) {
        const audio = new Audio("/pause_in.mp3");
        audio.play();
        theme.pause();
    } else if (event === Event.PauseOut) {
        const audio = new Audio("/pause_out.mp3");
        audio.play();
        theme.play();
    }
}

export default App;