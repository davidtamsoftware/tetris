import { mount } from "enzyme";
import React from "react";
import { Functions, Tetris } from "tetris-core";
import { Fill, GameState } from "tetris-core/lib/models";
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
    const wrapper = mount(<SinglePlayer />);
    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { key: "ArrowDown" } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.drop).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks move left", () => {
    const wrapper = mount(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { key: "ArrowLeft" } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.moveLeft).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks move right", () => {
    const wrapper = mount(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { key: "ArrowRight" } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.moveRight).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks hard drop", () => {
    const wrapper = mount(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { key: " " } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.drop).toBeCalledTimes(1);
    expect((mockTetrisInstance.drop as jest.Mock).mock.calls[0][0]).toBe(true);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks rotate left", () => {
    const wrapper = mount(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { key: "ShiftRight" } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.rotateLeft).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks rotate right", () => {
    const wrapper = mount(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { key: "ArrowUp" } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.rotateRight).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks pause", () => {
    const wrapper = mount(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    const evt = new KeyboardEvent("keydown", { key: "Escape" } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.togglePause).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });

  it("should be able to handle when player clicks restart", async () => {
    (Functions as any).merge = jest.fn(() => ({ playfield: [[Fill.Blank]] }));
    mockTetris.prototype.getState = () => ({
      gameState: GameState.GameOver,
      playfield: [[Fill.Blank]],
      nextPiece: [[Fill.Blue]],
      scoreboard: {},
    }) as any;

    const wrapper = mount(<SinglePlayer />);

    expect(mockTetris).toBeCalledTimes(1);
    const mockTetrisInstance = mockTetris.mock.instances[0];
    expect(mockTetrisInstance.subscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.subscribeToEvent).toBeCalledTimes(1);
    expect(mockTetrisInstance.start).toBeCalledTimes(1);
    await new Promise((res) => setTimeout(res, 100)); // wait for refresh
    const evt = new KeyboardEvent("keydown", { key: "Enter" } as any);
    document.dispatchEvent(evt);
    expect(mockTetrisInstance.restart).toBeCalledTimes(1);
    wrapper.unmount();
    expect(mockTetrisInstance.unsubscribe).toBeCalledTimes(1);
    expect(mockTetrisInstance.unsubscribeToEvent).toBeCalledTimes(1);
  });
});
