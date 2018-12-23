import * as React from "react";
import Menu from "../../components/Menu";
import MultiplayerLocal from "../Multiplayer/Local";
import MultiplayerRemote from "../Multiplayer/Remote";
import SinglePlayer from "../SinglePlayer";

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
                <div style={{ width: "500px", margin: "0 auto", border: "0px solid white" }}>
                    {/* <BlockMatrix style={{ float: "left" }} matrix={[[1, 1, 1], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0]]} />
                    <BlockMatrix style={{ float: "left" }} matrix={[[2, 2, 2], [2, 0, 0], [2, 2, 2], [2, 0, 0], [2, 2, 2]]} />
                    <BlockMatrix style={{ float: "left" }} matrix={[[3, 3, 3], [0, 3, 0], [0, 3, 0], [0, 3, 0], [0, 3, 0]]} />
                    <BlockMatrix style={{ float: "left" }} matrix={[[4, 4, 4], [4, 0, 4], [4, 4, 0], [4, 0, 4], [4, 0, 4]]} />
                    <BlockMatrix style={{ float: "left" }} matrix={[[0, 5, 0], [0, 5, 0], [0, 5, 0], [0, 5, 0], [0, 5, 0]]} />
                    <BlockMatrix style={{ float: "left" }} matrix={[[6, 6, 6], [6, 0, 0], [6, 6, 6], [0, 0, 6], [6, 6, 6]]} /> */}
                    <h1><em>TETRIS</em></h1>
                </div>
                <div style={{ clear: "both" }}>
                    <Menu menu={mainMenu} notify={this.handle} />
                </div>
            </div>;
        } else if (this.state.gameMode === "SINGLE_PLAYER") {
            game = <SinglePlayer exit={this.returnToMain} />;
        } else if (this.state.gameMode === "MULTIPLAYER_LOCAL") {
            game = <MultiplayerLocal exit={this.returnToMain} />;
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

export type Key = "HOME" | "RESTART" | "RESUME" | "QUIT_CONFIRM" | "QUIT_CANCEL" | "SINGLE_PLAYER" | "MULTIPLAYER_LOCAL" | "MULTIPLAYER_REMOTE";

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
                    key: "MULTIPLAYER_LOCAL",
                },
                {
                    name: "Remote",
                    key: "MULTIPLAYER_REMOTE"
                }
            ]
        }
    ]
};

export default App;