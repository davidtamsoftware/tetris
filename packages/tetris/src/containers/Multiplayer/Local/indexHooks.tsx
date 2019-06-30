import * as React from "react";
import { Models, Multiplayer as MultiplayerAction } from "tetris-core";
import { MultiplayerMode } from "tetris-core/lib/actions/Multiplayer";
import { Multiplayer } from "..";
import Menu from "../../../components/Menu";
import { useMultiplayerLocal } from "../../../effects";
import { gameOverMenu, pauseMenu, Props } from "../../App";

const MultiplayerLocal = (props: Props & { mode: MultiplayerMode }) => {

  const { state, multiplayer, handleMenuSelect } = useMultiplayerLocal(props.mode, props.exit);

  return <Multiplayer
    {...state}
    mode={props.mode}
    pauseMenu={<Menu menu={pauseMenu} notify={handleMenuSelect} menuClose={multiplayer.togglePause.bind(multiplayer)} />}
    gameOverMenu={<Menu menu={gameOverMenu} notify={handleMenuSelect} />}
  />;
}

export default MultiplayerLocal;
