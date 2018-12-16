import "core-js/es6/array";
import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./containers/Multiplayer/Remote";
import "./index.css";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(
  <App />,
  document.getElementById("root") as HTMLElement
);
registerServiceWorker();
