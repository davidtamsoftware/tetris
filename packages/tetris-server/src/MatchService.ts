import { Match, MatchPlayer } from "./Match";

export class MatchService {

    private _matches: Match[];

    constructor() {
        this._matches = [];
    }

    get matches(): Match[] {
        return this._matches;
    }

    public findMatch(player: MatchPlayer): Match | null {
        const results = this._matches
            .filter((match) =>
                (match.player1 && match.player1.uid === player.uid) ||
                (match.player2 && match.player2.uid === player.uid));
        if (results.length !== 1) {
            return null;
        }
        return results[0];
    }

    public playerExit(player: MatchPlayer) {
        const match = this.findMatch(player);
        if (match) {
            match.quit(player);
            if (!match.player1 && !match.player2) {
                matchService.matches.splice(matchService.matches.indexOf(match), 1);
            }
        }
    }

    public getOrCreate(matchId: string): Match {
        const results = this._matches.filter((match) => match.matchId === matchId);
        if (results.length !== 1 || !results[0]) {
            const match = new Match(matchId);
            this._matches.push(match);
            return match;
        }
        return results[0];
    }
}

export const matchService = new MatchService();
