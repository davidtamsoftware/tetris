import * as React from "react";
import * as ReactDOM from "react-dom";
import App from ".";
import { MultiplayerMode } from "tetris-core/lib/actions/Multiplayer";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<App mode={MultiplayerMode.AttackMode} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
