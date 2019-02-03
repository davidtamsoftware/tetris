import React from "react";
import renderer from "react-test-renderer";
import { Scoreboard } from ".";

describe("<Scoreboard />", () => {
    it("renders correctly", () => {
        const tree = renderer
            .create(<Scoreboard scoreboard={{
                highscore: 20000,
                level: 2,
                lines: 5,
                score: 1500,
            }} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
