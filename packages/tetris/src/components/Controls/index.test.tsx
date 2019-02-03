import React from "react";
import renderer from "react-test-renderer";
import { Controls } from ".";

describe("<Controls />", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(<Controls />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
