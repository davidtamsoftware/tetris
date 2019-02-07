import { shallow } from "enzyme";
import React from "react";
import { Tetris } from "tetris-core";
import { GameState } from "tetris-core/lib/models";
import SinglePlayer from "..";

jest.mock("tetris-core");

const mockTetris = Tetris as jest.Mock<Tetris>;
mockTetris.prototype.getState = () => ({
  gameState: GameState.Active,
}) as any;

describe("<SinglePlayer />", () => {
  beforeEach(() => {
    mockTetris.mockClear();
  });

  it("should be able to handle when player clicks move down", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];;
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { keyCode: 40 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.drop).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks move left");
  it("should be able to handle when player clicks move right");
  it("should be able to handle when player clicks hard drop");
  it("should be able to handle when player clicks rotate left");
  it("should be able to handle when player clicks rotate right");
  it("should be able to handle when player clicks pause");
  it("should be able to handle when player clicks restart");
});
