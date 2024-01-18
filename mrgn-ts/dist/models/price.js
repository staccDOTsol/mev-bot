"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceBias = exports.parsePriceInfo = exports.getPriceWithConfidence = void 0;
const pyth_1 = require("../vendor/pyth");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const switchboard_1 = require("../vendor/switchboard");
const __1 = require("..");
const bank_1 = require("./bank");
var PriceBias;
(function (PriceBias) {
    PriceBias[PriceBias["Lowest"] = 0] = "Lowest";
    PriceBias[PriceBias["None"] = 1] = "None";
    PriceBias[PriceBias["Highest"] = 2] = "Highest";
})(PriceBias || (PriceBias = {}));
exports.PriceBias = PriceBias;
function parseOraclePriceData(oracleSetup, rawData) {
    const debug = require("debug")("mfi:oracle-loader");
    switch (oracleSetup) {
        case bank_1.OracleSetup.PythEma:
            const pythPriceData = (0, pyth_1.parsePriceData)(rawData);
            let priceData = pythPriceData.price;
            if (priceData === undefined) {
                priceData = pythPriceData.previousPrice;
            }
            let confidenceData = pythPriceData.confidence;
            if (confidenceData === undefined) {
                confidenceData = pythPriceData.previousConfidence;
            }
            const pythPriceRealtime = new bignumber_js_1.default(priceData);
            const pythConfidenceRealtime = new bignumber_js_1.default(confidenceData);
            const pythLowestPriceRealtime = pythPriceRealtime.minus(pythConfidenceRealtime.times(__1.PYTH_PRICE_CONF_INTERVALS));
            const pythHighestPriceRealtime = pythPriceRealtime.plus(pythConfidenceRealtime.times(__1.PYTH_PRICE_CONF_INTERVALS));
            const pythPrice = new bignumber_js_1.default(pythPriceData.emaPrice.value);
            const pythConfInterval = new bignumber_js_1.default(pythPriceData.emaConfidence.value);
            const pythLowestPrice = pythPrice.minus(pythConfInterval.times(__1.PYTH_PRICE_CONF_INTERVALS));
            const pythHighestPrice = pythPrice.plus(pythConfInterval.times(__1.PYTH_PRICE_CONF_INTERVALS));
            debug("Loaded pyth price rt=%s, w=%s", pythPriceRealtime.toString(), pythPrice.toString());
            return {
                priceRealtime: {
                    price: pythPriceRealtime,
                    confidence: pythConfidenceRealtime,
                    lowestPrice: pythLowestPriceRealtime,
                    highestPrice: pythHighestPriceRealtime,
                },
                priceWeighted: {
                    price: pythPrice,
                    confidence: pythConfInterval,
                    lowestPrice: pythLowestPrice,
                    highestPrice: pythHighestPrice,
                },
            };
        case bank_1.OracleSetup.SwitchboardV2:
            const aggData = switchboard_1.AggregatorAccountData.decode(rawData);
            const swbPrice = new bignumber_js_1.default(switchboard_1.AggregatorAccount.decodeLatestValue(aggData).toString());
            const swbConfidence = new bignumber_js_1.default(aggData.latestConfirmedRound.stdDeviation.toBig().toString());
            const swbLowestPrice = swbPrice.minus(swbConfidence.times(__1.SWB_PRICE_CONF_INTERVALS));
            const swbHighestPrice = swbPrice.plus(swbConfidence.times(__1.SWB_PRICE_CONF_INTERVALS));
            debug("Loaded pyth price rt=%s", swbPrice.toString());
            return {
                priceRealtime: {
                    price: swbPrice,
                    confidence: swbConfidence,
                    lowestPrice: swbLowestPrice,
                    highestPrice: swbHighestPrice,
                },
                priceWeighted: {
                    price: swbPrice,
                    confidence: swbConfidence,
                    lowestPrice: swbLowestPrice,
                    highestPrice: swbHighestPrice,
                },
            };
        default:
            console.log("Invalid oracle setup", oracleSetup);
            throw new Error(`Invalid oracle setup "${oracleSetup}"`);
    }
}
exports.parsePriceInfo = parseOraclePriceData;
function getPriceWithConfidence(oraclePrice, weighted) {
    return weighted ? oraclePrice.priceWeighted : oraclePrice.priceRealtime;
}
exports.getPriceWithConfidence = getPriceWithConfidence;
