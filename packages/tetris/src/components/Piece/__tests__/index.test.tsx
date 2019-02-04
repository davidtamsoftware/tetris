import React from "react";
import renderer from "react-test-renderer";
import { l } from "tetris-core/lib/models";
import { Piece } from "..";

describe("<NextPiece />", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(<Piece piece={l} size={"large"} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
