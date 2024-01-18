"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregatorAccount = void 0;
const account_1 = require("./account");
class AggregatorAccount extends account_1.Account {
    static decodeLatestValue(aggregator) {
        if ((aggregator.latestConfirmedRound?.numSuccess ?? 0) === 0) {
            return null;
        }
        const result = aggregator.latestConfirmedRound.result.toBig();
        return result;
    }
}
exports.AggregatorAccount = AggregatorAccount;
