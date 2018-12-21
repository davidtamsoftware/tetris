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
            game = <Menu menu={mainMenu} notify={this.handle}/>;
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