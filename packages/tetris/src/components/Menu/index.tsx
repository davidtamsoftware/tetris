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
        this.handleKeyDown = this.handleKeyDown.bind(this);
    };

    public componentWillMount() {
        // tslint:disable-next-line:no-console
        console.log("mounted");
        document.addEventListener("keydown", this.handleKeyDown);
    }

    public componentWillUnmount() {
        // tslint:disable-next-line:no-console
        console.log("Unmounted");
        document.removeEventListener("keydown", this.handleKeyDown);
    }

    public render() {
        const currMenu = this.state.menuState[this.state.menuState.length - 1];
        const menu =
            <div style={{ margin: "auto", border: "2px solid blue" }}>
                <h2>{currMenu.name}</h2>
                {currMenu.children && currMenu.children.
                    map((child, index) =>
                        // tslint:disable-next-line:jsx-no-lambda
                        <div style={{ border: `${index === this.state.selection ? "1" : "0"}px solid green` }} onClick={this.select} key={index}>
                            {child.name}
                        </div>)}
            </div>;

        return <div>
            {menu}
        </div>
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.keyCode === 38) {
            this.up();
        } else if (event.keyCode === 40) {
            this.down();
        } else if (event.keyCode === 13) {
            this.select();
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