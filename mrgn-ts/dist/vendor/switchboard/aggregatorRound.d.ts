import { SwitchboardDecimal } from "./switchboardDecimal";
export declare class AggregatorRound {
    /**
     * Maintains the number of successful responses received from nodes.
     * Nodes can submit one successful response per round.
     */
    numSuccess: any;
    /** Number of error responses. */
    numError: any;
    /** Whether an update request round has ended. */
    isClosed: any;
    /** Maintains the `solana_program::clock::Slot` that the round was opened at. */
    roundOpenSlot: any;
    /** Maintains the `solana_program::clock::UnixTimestamp;` the round was opened at. */
    roundOpenTimestamp: any;
    /** Maintains the current median of all successful round responses. */
    result: SwitchboardDecimal;
    /** Standard deviation of the accepted results in the round. */
    stdDeviation: SwitchboardDecimal;
    /** Maintains the minimum node response this round. */
    minResponse: SwitchboardDecimal;
    /** Maintains the maximum node response this round. */
    maxResponse: SwitchboardDecimal;
    /** Pubkeys of the oracles fulfilling this round. */
    oraclePubkeysData: any;
    /** Represents all successful node responses this round. `NaN` if empty. */
    mediansData: any;
    /** Current rewards/slashes oracles have received this round. */
    currentPayout: any;
    /** Keep track of which responses are fulfilled here. */
    mediansFulfilled: any;
    /** Keeps track of which errors are fulfilled here. */
    errorsFulfilled: any;
    constructor(fields: any);
    static layout(property: any): any;
    static fromDecoded(obj: any): AggregatorRound;
    static toEncodable(fields: any): {
        numSuccess: any;
        numError: any;
        isClosed: any;
        roundOpenSlot: any;
        roundOpenTimestamp: any;
        result: {
            mantissa: any;
            scale: any;
        };
        stdDeviation: {
            mantissa: any;
            scale: any;
        };
        minResponse: {
            mantissa: any;
            scale: any;
        };
        maxResponse: {
            mantissa: any;
            scale: any;
        };
        oraclePubkeysData: any;
        mediansData: any;
        currentPayout: any;
        mediansFulfilled: any;
        errorsFulfilled: any;
    };
    toJSON(): {
        numSuccess: any;
        numError: any;
        isClosed: any;
        roundOpenSlot: any;
        roundOpenTimestamp: any;
        result: {
            mantissa: any;
            /** Maintains the maximum node response this round. */
            scale: any;
        };
        stdDeviation: {
            mantissa: any;
            /** Maintains the maximum node response this round. */
            scale: any;
        };
        minResponse: {
            mantissa: any;
            /** Maintains the maximum node response this round. */
            scale: any;
        };
        maxResponse: {
            mantissa: any;
            /** Maintains the maximum node response this round. */
            scale: any;
        };
        oraclePubkeysData: any;
        mediansData: any;
        currentPayout: any;
        mediansFulfilled: any;
        errorsFulfilled: any;
    };
    static fromJSON(obj: any): AggregatorRound;
    toEncodable(): {
        numSuccess: any;
        numError: any;
        isClosed: any;
        roundOpenSlot: any;
        roundOpenTimestamp: any;
        result: {
            mantissa: any;
            scale: any;
        };
        stdDeviation: {
            mantissa: any;
            scale: any;
        };
        minResponse: {
            mantissa: any;
            scale: any;
        };
        maxResponse: {
            mantissa: any;
            scale: any;
        };
        oraclePubkeysData: any;
        mediansData: any;
        currentPayout: any;
        mediansFulfilled: any;
        errorsFulfilled: any;
    };
}
//# sourceMappingURL=aggregatorRound.d.ts.map