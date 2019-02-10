import { shallow } from "enzyme";
import React from "react";
import { Tetris } from "tetris-core";
import { GameState } from "tetris-core/lib/models";
import SinglePlayer from "..";

jest.mock("tetris-core");

const mockTetris = Tetris as jest.Mock<Tetris>;

describe("<SinglePlayer />", () => {
  beforeEach(() => {
    mockTetris.mockClear();
    mockTetris.prototype.getState = () => ({
      gameState: GameState.Active,
    }) as any;
  });

  it("should be able to handle when player clicks move down", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
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

  it("should be able to handle when player clicks move left", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { keyCode: 37 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.moveLeft).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks move right", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { keyCode: 39 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.moveRight).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks hard drop", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { keyCode: 32 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.drop).toBeCalledTimes(1);
    expect((mockTetrisInstance.drop as jest.Mock).mock.calls[0][0]).toBe(true);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks rotate left", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { keyCode: 90 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.rotateLeft).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks rotate right", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { keyCode: 38 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.rotateRight).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks pause", () => {
    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { keyCode: 27 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.togglePause).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks restart", async () => {
    mockTetris.prototype.getState = () => ({
      gameState: GameState.GameOver,
    }) as any;

    const wrapper = shallow(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    await new Promise((res, rej) => setTimeout(res, 100)); // wait for refresh
    const evt = new KeyboardEvent("keydown", { keyCode: 82 } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.restart).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });
});
