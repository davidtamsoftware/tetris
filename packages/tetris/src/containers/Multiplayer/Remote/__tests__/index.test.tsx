import React from "react";

xdescribe("<Remote />", () => {
  describe("Multiplayer form", () => {
    it("should display validation error if user does not enter match id");
    it("should display no validation error and proceed to waiting area for match to begin");
  });

  describe("Match waiting area", () => {
    it("should display validation error if user does not enter match id");
    it("should display no validation error and proceed to waiting area for match to begin");
  });

  describe("Multiplayer game", () => {
    it("should be able to handle when player clicks move down");
    it("should be able to handle when player clicks move left");
    it("should be able to handle when player clicks move right");
    it("should be able to handle when player clicks hard drop");
    it("should be able to handle when player clicks rotate left");
    it("should be able to handle when player clicks rotate right");
    it("should be able to handle when player clicks pause");
    it("should be able to handle when player clicks restart");
  });
});
