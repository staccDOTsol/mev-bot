"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregatorAccountData = void 0;
const borsh = __importStar(require("@coral-xyz/borsh"));
const switchboardDecimal_1 = require("./switchboardDecimal");
const aggregatorRound_1 = require("./aggregatorRound");
const Hash_1 = require("./Hash");
const AggregatorResolutionMode = __importStar(require("./AggregatorResolutionMode"));
class AggregatorAccountData {
    constructor(fields) {
        this.name = fields.name;
        this.metadata = fields.metadata;
        this.reserved1 = fields.reserved1;
        this.queuePubkey = fields.queuePubkey;
        this.oracleRequestBatchSize = fields.oracleRequestBatchSize;
        this.minOracleResults = fields.minOracleResults;
        this.minJobResults = fields.minJobResults;
        this.minUpdateDelaySeconds = fields.minUpdateDelaySeconds;
        this.startAfter = fields.startAfter;
        this.varianceThreshold = new switchboardDecimal_1.SwitchboardDecimal({
            ...fields.varianceThreshold,
        });
        this.forceReportPeriod = fields.forceReportPeriod;
        this.expiration = fields.expiration;
        this.consecutiveFailureCount = fields.consecutiveFailureCount;
        this.nextAllowedUpdateTime = fields.nextAllowedUpdateTime;
        this.isLocked = fields.isLocked;
        this.crankPubkey = fields.crankPubkey;
        this.latestConfirmedRound = new aggregatorRound_1.AggregatorRound({
            ...fields.latestConfirmedRound,
        });
        this.currentRound = new aggregatorRound_1.AggregatorRound({ ...fields.currentRound });
        this.jobPubkeysData = fields.jobPubkeysData;
        this.jobHashes = fields.jobHashes.map((item) => new Hash_1.Hash({ ...item }));
        this.jobPubkeysSize = fields.jobPubkeysSize;
        this.jobsChecksum = fields.jobsChecksum;
        this.authority = fields.authority;
        this.historyBuffer = fields.historyBuffer;
        this.previousConfirmedRoundResult = new switchboardDecimal_1.SwitchboardDecimal({
            ...fields.previousConfirmedRoundResult,
        });
        this.previousConfirmedRoundSlot = fields.previousConfirmedRoundSlot;
        this.disableCrank = fields.disableCrank;
        this.jobWeights = fields.jobWeights;
        this.creationTimestamp = fields.creationTimestamp;
        this.resolutionMode = fields.resolutionMode;
        this.basePriorityFee = fields.basePriorityFee;
        this.priorityFeeBump = fields.priorityFeeBump;
        this.priorityFeeBumpPeriod = fields.priorityFeeBumpPeriod;
        this.maxPriorityFeeMultiplier = fields.maxPriorityFeeMultiplier;
        this.ebuf = fields.ebuf;
    }
    static decode(data) {
        if (!data.slice(0, 8).equals(AggregatorAccountData.discriminator)) {
            throw new Error("invalid account discriminator");
        }
        const dec = AggregatorAccountData.layout.decode(data.slice(8));
        return new AggregatorAccountData({
            name: dec.name,
            metadata: dec.metadata,
            reserved1: dec.reserved1,
            queuePubkey: dec.queuePubkey,
            oracleRequestBatchSize: dec.oracleRequestBatchSize,
            minOracleResults: dec.minOracleResults,
            minJobResults: dec.minJobResults,
            minUpdateDelaySeconds: dec.minUpdateDelaySeconds,
            startAfter: dec.startAfter,
            varianceThreshold: switchboardDecimal_1.SwitchboardDecimal.fromDecoded(dec.varianceThreshold),
            forceReportPeriod: dec.forceReportPeriod,
            expiration: dec.expiration,
            consecutiveFailureCount: dec.consecutiveFailureCount,
            nextAllowedUpdateTime: dec.nextAllowedUpdateTime,
            isLocked: dec.isLocked,
            crankPubkey: dec.crankPubkey,
            latestConfirmedRound: aggregatorRound_1.AggregatorRound.fromDecoded(dec.latestConfirmedRound),
            currentRound: aggregatorRound_1.AggregatorRound.fromDecoded(dec.currentRound),
            jobPubkeysData: dec.jobPubkeysData,
            jobHashes: dec.jobHashes.map((item) => Hash_1.Hash.fromDecoded(item)),
            jobPubkeysSize: dec.jobPubkeysSize,
            jobsChecksum: dec.jobsChecksum,
            authority: dec.authority,
            historyBuffer: dec.historyBuffer,
            previousConfirmedRoundResult: switchboardDecimal_1.SwitchboardDecimal.fromDecoded(dec.previousConfirmedRoundResult),
            previousConfirmedRoundSlot: dec.previousConfirmedRoundSlot,
            disableCrank: dec.disableCrank,
            jobWeights: dec.jobWeights,
            creationTimestamp: dec.creationTimestamp,
            resolutionMode: AggregatorResolutionMode.fromDecoded(dec.resolutionMode),
            basePriorityFee: dec.basePriorityFee,
            priorityFeeBump: dec.priorityFeeBump,
            priorityFeeBumpPeriod: dec.priorityFeeBumpPeriod,
            maxPriorityFeeMultiplier: dec.maxPriorityFeeMultiplier,
            ebuf: dec.ebuf,
        });
    }
}
exports.AggregatorAccountData = AggregatorAccountData;
AggregatorAccountData.discriminator = Buffer.from([217, 230, 65, 101, 201, 162, 27, 125]);
AggregatorAccountData.layout = borsh.struct([
    borsh.array(borsh.u8(), 32, "name"),
    borsh.array(borsh.u8(), 128, "metadata"),
    borsh.array(borsh.u8(), 32, "reserved1"),
    borsh.publicKey("queuePubkey"),
    borsh.u32("oracleRequestBatchSize"),
    borsh.u32("minOracleResults"),
    borsh.u32("minJobResults"),
    borsh.u32("minUpdateDelaySeconds"),
    borsh.i64("startAfter"),
    switchboardDecimal_1.SwitchboardDecimal.layout("varianceThreshold"),
    borsh.i64("forceReportPeriod"),
    borsh.i64("expiration"),
    borsh.u64("consecutiveFailureCount"),
    borsh.i64("nextAllowedUpdateTime"),
    borsh.bool("isLocked"),
    borsh.publicKey("crankPubkey"),
    aggregatorRound_1.AggregatorRound.layout("latestConfirmedRound"),
    aggregatorRound_1.AggregatorRound.layout("currentRound"),
    borsh.array(borsh.publicKey(), 16, "jobPubkeysData"),
    borsh.array(Hash_1.Hash.layout({}), 16, "jobHashes"),
    borsh.u32("jobPubkeysSize"),
    borsh.array(borsh.u8(), 32, "jobsChecksum"),
    borsh.publicKey("authority"),
    borsh.publicKey("historyBuffer"),
    switchboardDecimal_1.SwitchboardDecimal.layout("previousConfirmedRoundResult"),
    borsh.u64("previousConfirmedRoundSlot"),
    borsh.bool("disableCrank"),
    borsh.array(borsh.u8(), 16, "jobWeights"),
    borsh.i64("creationTimestamp"),
    AggregatorResolutionMode.layout("resolutionMode"),
    borsh.u32("basePriorityFee"),
    borsh.u32("priorityFeeBump"),
    borsh.u32("priorityFeeBumpPeriod"),
    borsh.u32("maxPriorityFeeMultiplier"),
    borsh.array(borsh.u8(), 122, "ebuf"),
]);
