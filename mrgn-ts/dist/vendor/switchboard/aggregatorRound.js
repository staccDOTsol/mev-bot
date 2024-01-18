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
exports.AggregatorRound = void 0;
// import * as types from "../types/index.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
const borsh = __importStar(require("@coral-xyz/borsh"));
const web3_js_1 = require("@solana/web3.js");
// import { BN } from "@switchboard-xyz/common"; // eslint-disable-line @typescript-eslint/no-unused-vars
const switchboardDecimal_1 = require("./switchboardDecimal");
const anchor_1 = require("@coral-xyz/anchor");
class AggregatorRound {
    constructor(fields) {
        this.numSuccess = fields.numSuccess;
        this.numError = fields.numError;
        this.isClosed = fields.isClosed;
        this.roundOpenSlot = fields.roundOpenSlot;
        this.roundOpenTimestamp = fields.roundOpenTimestamp;
        this.result = new switchboardDecimal_1.SwitchboardDecimal({ ...fields.result });
        this.stdDeviation = new switchboardDecimal_1.SwitchboardDecimal({
            ...fields.stdDeviation,
        });
        this.minResponse = new switchboardDecimal_1.SwitchboardDecimal({ ...fields.minResponse });
        this.maxResponse = new switchboardDecimal_1.SwitchboardDecimal({ ...fields.maxResponse });
        this.oraclePubkeysData = fields.oraclePubkeysData;
        this.mediansData = fields.mediansData.map((item) => new switchboardDecimal_1.SwitchboardDecimal({ ...item }));
        this.currentPayout = fields.currentPayout;
        this.mediansFulfilled = fields.mediansFulfilled;
        this.errorsFulfilled = fields.errorsFulfilled;
    }
    static layout(property) {
        return borsh.struct([
            borsh.u32("numSuccess"),
            borsh.u32("numError"),
            borsh.bool("isClosed"),
            borsh.u64("roundOpenSlot"),
            borsh.i64("roundOpenTimestamp"),
            switchboardDecimal_1.SwitchboardDecimal.layout("result"),
            switchboardDecimal_1.SwitchboardDecimal.layout("stdDeviation"),
            switchboardDecimal_1.SwitchboardDecimal.layout("minResponse"),
            switchboardDecimal_1.SwitchboardDecimal.layout("maxResponse"),
            borsh.array(borsh.publicKey(), 16, "oraclePubkeysData"),
            borsh.array(switchboardDecimal_1.SwitchboardDecimal.layout({}), 16, "mediansData"),
            borsh.array(borsh.i64(), 16, "currentPayout"),
            borsh.array(borsh.bool(), 16, "mediansFulfilled"),
            borsh.array(borsh.bool(), 16, "errorsFulfilled"),
        ], property);
    }
    static fromDecoded(obj) {
        return new AggregatorRound({
            numSuccess: obj.numSuccess,
            numError: obj.numError,
            isClosed: obj.isClosed,
            roundOpenSlot: obj.roundOpenSlot,
            roundOpenTimestamp: obj.roundOpenTimestamp,
            result: switchboardDecimal_1.SwitchboardDecimal.fromDecoded(obj.result),
            stdDeviation: switchboardDecimal_1.SwitchboardDecimal.fromDecoded(obj.stdDeviation),
            minResponse: switchboardDecimal_1.SwitchboardDecimal.fromDecoded(obj.minResponse),
            maxResponse: switchboardDecimal_1.SwitchboardDecimal.fromDecoded(obj.maxResponse),
            oraclePubkeysData: obj.oraclePubkeysData,
            mediansData: obj.mediansData.map((item) => switchboardDecimal_1.SwitchboardDecimal.fromDecoded(item)),
            currentPayout: obj.currentPayout,
            mediansFulfilled: obj.mediansFulfilled,
            errorsFulfilled: obj.errorsFulfilled,
        });
    }
    static toEncodable(fields) {
        return {
            numSuccess: fields.numSuccess,
            numError: fields.numError,
            isClosed: fields.isClosed,
            roundOpenSlot: fields.roundOpenSlot,
            roundOpenTimestamp: fields.roundOpenTimestamp,
            result: switchboardDecimal_1.SwitchboardDecimal.toEncodable(fields.result),
            stdDeviation: switchboardDecimal_1.SwitchboardDecimal.toEncodable(fields.stdDeviation),
            minResponse: switchboardDecimal_1.SwitchboardDecimal.toEncodable(fields.minResponse),
            maxResponse: switchboardDecimal_1.SwitchboardDecimal.toEncodable(fields.maxResponse),
            oraclePubkeysData: fields.oraclePubkeysData,
            mediansData: fields.mediansData.map((item) => switchboardDecimal_1.SwitchboardDecimal.toEncodable(item)),
            currentPayout: fields.currentPayout,
            mediansFulfilled: fields.mediansFulfilled,
            errorsFulfilled: fields.errorsFulfilled,
        };
    }
    toJSON() {
        return {
            numSuccess: this.numSuccess,
            numError: this.numError,
            isClosed: this.isClosed,
            roundOpenSlot: this.roundOpenSlot.toString(),
            roundOpenTimestamp: this.roundOpenTimestamp.toString(),
            result: this.result.toJSON(),
            stdDeviation: this.stdDeviation.toJSON(),
            minResponse: this.minResponse.toJSON(),
            maxResponse: this.maxResponse.toJSON(),
            oraclePubkeysData: this.oraclePubkeysData.map((item) => item.toString()),
            mediansData: this.mediansData.map((item) => item.toJSON()),
            currentPayout: this.currentPayout.map((item) => item.toString()),
            mediansFulfilled: this.mediansFulfilled,
            errorsFulfilled: this.errorsFulfilled,
        };
    }
    static fromJSON(obj) {
        return new AggregatorRound({
            numSuccess: obj.numSuccess,
            numError: obj.numError,
            isClosed: obj.isClosed,
            roundOpenSlot: new anchor_1.BN(obj.roundOpenSlot),
            roundOpenTimestamp: new anchor_1.BN(obj.roundOpenTimestamp),
            result: switchboardDecimal_1.SwitchboardDecimal.fromJSON(obj.result),
            stdDeviation: switchboardDecimal_1.SwitchboardDecimal.fromJSON(obj.stdDeviation),
            minResponse: switchboardDecimal_1.SwitchboardDecimal.fromJSON(obj.minResponse),
            maxResponse: switchboardDecimal_1.SwitchboardDecimal.fromJSON(obj.maxResponse),
            oraclePubkeysData: obj.oraclePubkeysData.map((item) => new web3_js_1.PublicKey(item)),
            mediansData: obj.mediansData.map((item) => switchboardDecimal_1.SwitchboardDecimal.fromJSON(item)),
            currentPayout: obj.currentPayout.map((item) => new anchor_1.BN(item)),
            mediansFulfilled: obj.mediansFulfilled,
            errorsFulfilled: obj.errorsFulfilled,
        });
    }
    toEncodable() {
        return AggregatorRound.toEncodable(this);
    }
}
exports.AggregatorRound = AggregatorRound;
