import * as React from "react";

interface State {
    menuState: Node[];
    selection: number;
};

interface Props {
    menu: Node;
    notify: any;
    menuClose?: any;
}

class Menu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            menuState: [props.menu],
            selection: 0,
        };
    };

    public componentWillReceiveProps(nextProps: Props) {
        if (this.props.menu !== nextProps.menu) {
            this.setState({
                menuState: [nextProps.menu],
                selection: 0,
            });
        }
    }

    public componentDidMount() {
        document.addEventListener("keydown", this.handleKeyDown);
    }

    public componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    public render() {
        const currMenu = this.state.menuState[this.state.menuState.length - 1];
        const menu =
            <div style={{
                textAlign: "center",
                width: "400px",
                borderRadius: "5px",
                margin: "auto",
                border: "5px solid white",
                padding: "20px"
            }}>
                <div style={{ fontSize: "1.7em", padding: "0 0 15px" }}>{currMenu.name}</div>
                {currMenu.children && currMenu.children.
                    map((child, index) =>
                        <div style={{ borderRadius: "5px", border: `3px solid ${index === this.state.selection ? "green" : "transparent"}`, padding: "10px" }}
                            // tslint:disable-next-line:jsx-no-lambda
                            onClick={() => this.selection(index, true)} onMouseMove={() => this.selection(index)} key={index}>
                            {child.name}
                        </div>)}
            </div>;

        return <div>
            {menu}
        </div>
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.keyCode === 38) {
            this.up();
        } else if (event.keyCode === 40) {
            this.down();
        } else if (event.keyCode === 13) {
            this.selection(this.state.selection, true);
        } else if (event.keyCode === 27 || event.keyCode === 8) {
            this.back();
        }
    }

    private up = () => {
        const currMenu = this.state.menuState[this.state.menuState.length - 1];
        const size = currMenu.children && currMenu.children.length;
        if (!size) {
            return;
        }
        const index = this.state.selection - 1;
        this.setState({
            selection: index < 0 ? size - 1 : index,
        });
    }

    private down = () => {
        const currMenu = this.state.menuState[this.state.menuState.length - 1];
        const size = currMenu.children && currMenu.children.length;
        if (!size) {
            return;
        }
        const index = this.state.selection + 1;
        this.setState({
            selection: index > size - 1 ? 0 : index,
        });
    }

    private selection = (index: number, click?: boolean) => {
        this.setState({
            selection: index,
        }, click ? this.select : undefined);
    }

    private select = () => {
        const currMenu = this.state.menuState[this.state.menuState.length - 1];
        const size = currMenu.children && currMenu.children.length;
        if (!size) {
            return;
        }
        if (!(currMenu as any).children[this.state.selection].children) {
            const success = this.props.notify((currMenu as any).children[this.state.selection].key);
            if (!success) {
                this.back();
            }
            return;
        }
        this.setState({
            menuState: [...this.state.menuState, (currMenu as any).children[this.state.selection]],
            selection: 0,
        });
    }

    private back = () => {
        if (this.state.menuState.length === 1) {
            if (this.props.menuClose) {
                this.props.menuClose();
            }
            return;
        }
        this.setState({
            menuState: this.state.menuState.slice(0, this.state.menuState.length - 1),
            selection: 0,
        });
    }
}

interface Node {
    name: string;
    key?: string;
    children?: Node[];
}

export default Menu;