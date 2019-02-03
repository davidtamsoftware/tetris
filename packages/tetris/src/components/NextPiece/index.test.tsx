import React from "react";
import renderer from "react-test-renderer";
import { l } from "tetris-core/lib/models";
import { NextPiece } from ".";

describe("<NextPiece />", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(<NextPiece piece={l} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
