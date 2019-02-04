import React from "react";
import renderer from "react-test-renderer";
import { Fill } from "tetris-core/lib/models";
import { Block } from "..";

describe("<Block />", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(<Block data={Fill.Blue} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
