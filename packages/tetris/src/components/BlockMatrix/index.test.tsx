import React from "react";
import renderer from "react-test-renderer";
import { l } from "tetris-core/lib/models";
import { BlockMatrix } from ".";

describe("<BlockMatrix />", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(<BlockMatrix matrix={l} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
