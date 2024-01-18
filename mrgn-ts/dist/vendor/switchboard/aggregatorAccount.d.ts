import { Account } from "./account";
export declare class AggregatorAccount extends Account {
    static decodeLatestValue(aggregator: {
        latestConfirmedRound: {
            numSuccess: any;
            result: {
                toBig: () => any;
            };
        };
    }): any;
}
//# sourceMappingURL=aggregatorAccount.d.ts.map