/// <reference types="node" />
import { SwitchboardDecimal } from "./switchboardDecimal";
import { AggregatorRound } from "./aggregatorRound";
export declare class AggregatorAccountData {
    /** Name of the aggregator to store on-chain. */
    name: any;
    /** Metadata of the aggregator to store on-chain. */
    metadata: any;
    /** Reserved. */
    reserved1: any;
    /** Pubkey of the queue the aggregator belongs to. */
    queuePubkey: any;
    /**
     * CONFIGS
     * Number of oracles assigned to an update request.
     */
    oracleRequestBatchSize: any;
    /** Minimum number of oracle responses required before a round is validated. */
    minOracleResults: any;
    /** Minimum number of job results before an oracle accepts a result. */
    minJobResults: any;
    /** Minimum number of seconds required between aggregator rounds. */
    minUpdateDelaySeconds: any;
    /** Unix timestamp for which no feed update will occur before. */
    startAfter: any;
    /** Change percentage required between a previous round and the current round. If variance percentage is not met, reject new oracle responses. */
    varianceThreshold: SwitchboardDecimal;
    /** Number of seconds for which, even if the variance threshold is not passed, accept new responses from oracles. */
    forceReportPeriod: any;
    /** Timestamp when the feed is no longer needed. */
    expiration: any;
    /** Counter for the number of consecutive failures before a feed is removed from a queue. If set to 0, failed feeds will remain on the queue. */
    consecutiveFailureCount: any;
    /** Timestamp when the next update request will be available. */
    nextAllowedUpdateTime: any;
    /** Flag for whether an aggregators configuration is locked for editing. */
    isLocked: any;
    /** Optional, public key of the crank the aggregator is currently using. Event based feeds do not need a crank. */
    crankPubkey: any;
    /** Latest confirmed update request result that has been accepted as valid. */
    latestConfirmedRound: AggregatorRound;
    /** Oracle results from the current round of update request that has not been accepted as valid yet. */
    currentRound: AggregatorRound;
    /** List of public keys containing the job definitions for how data is sourced off-chain by oracles. */
    jobPubkeysData: any;
    /** Used to protect against malicious RPC nodes providing incorrect task definitions to oracles before fulfillment. */
    jobHashes: any;
    /** Number of jobs assigned to an oracle. */
    jobPubkeysSize: any;
    /** Used to protect against malicious RPC nodes providing incorrect task definitions to oracles before fulfillment. */
    jobsChecksum: any;
    /** The account delegated as the authority for making account changes. */
    authority: any;
    /** Optional, public key of a history buffer account storing the last N accepted results and their timestamps. */
    historyBuffer: any;
    /** The previous confirmed round result. */
    previousConfirmedRoundResult: SwitchboardDecimal;
    /** The slot when the previous confirmed round was opened. */
    previousConfirmedRoundSlot: any;
    /** Whether an aggregator is permitted to join a crank. */
    disableCrank: any;
    /** Job weights used for the weighted median of the aggregator's assigned job accounts. */
    jobWeights: any;
    /** Unix timestamp when the feed was created. */
    creationTimestamp: any;
    /**
     * Use sliding window or round based resolution
     * NOTE: This changes result propogation in latest_round_result
     */
    resolutionMode: any;
    basePriorityFee: any;
    priorityFeeBump: any;
    priorityFeeBumpPeriod: any;
    maxPriorityFeeMultiplier: any;
    /** Reserved for future info. */
    ebuf: any;
    static discriminator: Buffer;
    static layout: any;
    constructor(fields: any);
    static decode(data: any): AggregatorAccountData;
}
//# sourceMappingURL=aggregatorAccountData.d.ts.map