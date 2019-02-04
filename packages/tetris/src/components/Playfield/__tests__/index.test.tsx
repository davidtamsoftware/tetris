import React from "react";
import renderer from "react-test-renderer";
import { Fill, GameState } from "tetris-core/lib/models";
import { Playfield } from "..";

describe("<NextPiece />", () => {
    it("renders correctly", () => {
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
});
