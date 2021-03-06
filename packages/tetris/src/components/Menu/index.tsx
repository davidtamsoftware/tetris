import * as React from "react";
import { Key } from "../../containers/App";
import styles from "./index.module.css";

/**
 * key defines the back
 * boolean true will close the menu, false will pop menu
 */
export type MenuHandler = (key: Key) => boolean;

interface State {
    menuState: Node[];
    selection: number;
};

interface Props {
    menu: Node;
    notify: MenuHandler;
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
            <div className={styles.menu}>
                <div className={styles.menuTitle}>{currMenu.name}</div>
                {currMenu.children && currMenu.children.
                    map((child, index) =>
                        <div className={`${styles.menuItem} ${index === this.state.selection ? styles.selected : ""}`}
                            onClick={this.handleSelection}
                            onMouseMove={this.handleSelection}
                            key={index}
                            data-key={index}>
                            {child.name}
                        </div>)}
            </div>;

        return menu;
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "ArrowUp" || event.key === "Up") {
            this.up();
        } else if (event.key === "ArrowDown" || event.key === "Down") {
            this.down();
        } else if (event.key === "Enter") {
            this.selection(this.state.selection, true);
        } else if (event.key === "Escape" || event.key === "Esc" || event.key === "Backspace") {
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

    private handleSelection = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const index = parseInt(e.currentTarget.getAttribute("data-key") as string, 10);
        this.selection(index, e.type === "click");
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