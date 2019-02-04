import React from "react";
import renderer from "react-test-renderer";
import { l, o, s } from "tetris-core/lib/models";
import { Stats } from "..";

describe("<Stats />", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(<Stats stats={{
                [o.toString()]: 15,
                [l.toString()]: 20,
                [s.toString()]: 25,
            }}/>)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
