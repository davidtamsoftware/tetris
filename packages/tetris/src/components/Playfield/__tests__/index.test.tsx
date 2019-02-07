import React from "react";
import renderer from "react-test-renderer";
import { Fill, GameState } from "tetris-core/lib/models";
import { Playfield } from "..";

describe("<Playfield />", () => {
    it("renders active state correctly", () => {
        const tree = renderer
            .create(<Playfield gameState={GameState.Active} playfield={[
                [Fill.Blank, Fill.Blank, Fill.Blank],
                [Fill.Blank, Fill.Blank, Fill.Blank],
                [Fill.Blank, Fill.Blank, Fill.Blue],
                [Fill.Blue, Fill.Blue, Fill.Blue],
            ]} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders pause state correctly", () => {
        const tree = renderer
            .create(<Playfield gameState={GameState.Paused} playfield={[
                [Fill.Blank, Fill.Blank, Fill.Blank],
                [Fill.Blank, Fill.Blank, Fill.Blank],
                [Fill.Blank, Fill.Blank, Fill.Blue],
                [Fill.Blue, Fill.Blue, Fill.Blue],
            ]} />)
            .toJSON();
        expect(tree).toMatchSnapshot();
    });
});
