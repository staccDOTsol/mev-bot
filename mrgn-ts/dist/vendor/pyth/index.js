"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePriceData = exports.PriceType = exports.AccountType = exports.CorpAction = exports.PriceStatus = exports.MAX_SLOT_DIFFERENCE = void 0;
const readBig_1 = require("./readBig");
const web3_js_1 = require("@solana/web3.js");
/** Number of slots that can pass before a publisher's price is no longer included in the aggregate. */
exports.MAX_SLOT_DIFFERENCE = 25;
const empty32Buffer = Buffer.alloc(32);
const PKorNull = (data) => (data.equals(empty32Buffer) ? null : new web3_js_1.PublicKey(data));
var PriceStatus;
(function (PriceStatus) {
    PriceStatus[PriceStatus["Unknown"] = 0] = "Unknown";
    PriceStatus[PriceStatus["Trading"] = 1] = "Trading";
    PriceStatus[PriceStatus["Halted"] = 2] = "Halted";
    PriceStatus[PriceStatus["Auction"] = 3] = "Auction";
    PriceStatus[PriceStatus["Ignored"] = 4] = "Ignored";
})(PriceStatus = exports.PriceStatus || (exports.PriceStatus = {}));
var CorpAction;
(function (CorpAction) {
    CorpAction[CorpAction["NoCorpAct"] = 0] = "NoCorpAct";
})(CorpAction = exports.CorpAction || (exports.CorpAction = {}));
const parsePriceInfo = (data, exponent) => {
    // aggregate price
    const priceComponent = (0, readBig_1.readBigInt64LE)(data, 0);
    const price = Number(priceComponent) * 10 ** exponent;
    // aggregate confidence
    const confidenceComponent = (0, readBig_1.readBigUInt64LE)(data, 8);
    const confidence = Number(confidenceComponent) * 10 ** exponent;
    // aggregate status
    const status = data.readUInt32LE(16);
    // aggregate corporate action
    const corporateAction = data.readUInt32LE(20);
    // aggregate publish slot. It is converted to number to be consistent with Solana's library interface (Slot there is number)
    const publishSlot = Number((0, readBig_1.readBigUInt64LE)(data, 24));
    return {
        priceComponent,
        price,
        confidenceComponent,
        confidence,
        status,
        corporateAction,
        publishSlot,
    };
};
var AccountType;
(function (AccountType) {
    AccountType[AccountType["Unknown"] = 0] = "Unknown";
    AccountType[AccountType["Mapping"] = 1] = "Mapping";
    AccountType[AccountType["Product"] = 2] = "Product";
    AccountType[AccountType["Price"] = 3] = "Price";
    AccountType[AccountType["Test"] = 4] = "Test";
    AccountType[AccountType["Permission"] = 5] = "Permission";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
var PriceType;
(function (PriceType) {
    PriceType[PriceType["Unknown"] = 0] = "Unknown";
    PriceType[PriceType["Price"] = 1] = "Price";
})(PriceType = exports.PriceType || (exports.PriceType = {}));
// Provide currentSlot when available to allow status to consider the case when price goes stale. It is optional because
// it requires an extra request to get it when it is not available which is not always efficient.
const parsePriceData = (data, currentSlot) => {
    // pyth magic number
    const magic = data.readUInt32LE(0);
    // program version
    const version = data.readUInt32LE(4);
    // account type
    const type = data.readUInt32LE(8);
    // price account size
    const size = data.readUInt32LE(12);
    // price or calculation type
    const priceType = data.readUInt32LE(16);
    // price exponent
    const exponent = data.readInt32LE(20);
    // number of component prices
    const numComponentPrices = data.readUInt32LE(24);
    // number of quoters that make up aggregate
    const numQuoters = data.readUInt32LE(28);
    // slot of last valid (not unknown) aggregate price
    const lastSlot = (0, readBig_1.readBigUInt64LE)(data, 32);
    // valid on-chain slot of aggregate price
    const validSlot = (0, readBig_1.readBigUInt64LE)(data, 40);
    // exponential moving average price
    const emaPrice = parseEma(data.slice(48, 72), exponent);
    // exponential moving average confidence interval
    const emaConfidence = parseEma(data.slice(72, 96), exponent);
    // timestamp of the current price
    const timestamp = (0, readBig_1.readBigInt64LE)(data, 96);
    // minimum number of publishers for status to be TRADING
    const minPublishers = data.readUInt8(104);
    // space for future derived values
    const drv2 = data.readInt8(105);
    // space for future derived values
    const drv3 = data.readInt16LE(106);
    // space for future derived values
    const drv4 = data.readInt32LE(108);
    // product id / reference account
    const productAccountKey = new web3_js_1.PublicKey(data.slice(112, 144));
    // next price account in list
    const nextPriceAccountKey = PKorNull(data.slice(144, 176));
    // valid slot of previous update
    const previousSlot = (0, readBig_1.readBigUInt64LE)(data, 176);
    // aggregate price of previous update
    const previousPriceComponent = (0, readBig_1.readBigInt64LE)(data, 184);
    const previousPrice = Number(previousPriceComponent) * 10 ** exponent;
    // confidence interval of previous update
    const previousConfidenceComponent = (0, readBig_1.readBigUInt64LE)(data, 192);
    const previousConfidence = Number(previousConfidenceComponent) * 10 ** exponent;
    // space for future derived values
    const previousTimestamp = (0, readBig_1.readBigInt64LE)(data, 200);
    const aggregate = parsePriceInfo(data.slice(208, 240), exponent);
    let status = aggregate.status;
    if (currentSlot && status === PriceStatus.Trading) {
        if (currentSlot - aggregate.publishSlot > exports.MAX_SLOT_DIFFERENCE) {
            status = PriceStatus.Unknown;
        }
    }
    let price;
    let confidence;
    if (status === PriceStatus.Trading) {
        price = aggregate.price;
        confidence = aggregate.confidence;
    }
    // price components - up to 32
    const priceComponents = [];
    let offset = 240;
    while (priceComponents.length < numComponentPrices) {
        const publisher = new web3_js_1.PublicKey(data.slice(offset, offset + 32));
        offset += 32;
        const componentAggregate = parsePriceInfo(data.slice(offset, offset + 32), exponent);
        offset += 32;
        const latest = parsePriceInfo(data.slice(offset, offset + 32), exponent);
        offset += 32;
        priceComponents.push({ publisher, aggregate: componentAggregate, latest });
    }
    return {
        magic,
        version,
        type,
        size,
        priceType,
        exponent,
        numComponentPrices,
        numQuoters,
        lastSlot,
        validSlot,
        emaPrice,
        emaConfidence,
        timestamp,
        minPublishers,
        drv2,
        drv3,
        drv4,
        productAccountKey,
        nextPriceAccountKey,
        previousSlot,
        previousPriceComponent,
        previousPrice,
        previousConfidenceComponent,
        previousConfidence,
        previousTimestamp,
        aggregate,
        priceComponents,
        price,
        confidence,
        status,
    };
};
exports.parsePriceData = parsePriceData;
const parseEma = (data, exponent) => {
    // current value of ema
    const valueComponent = (0, readBig_1.readBigInt64LE)(data, 0);
    const value = Number(valueComponent) * 10 ** exponent;
    // numerator state for next update
    const numerator = (0, readBig_1.readBigInt64LE)(data, 8);
    // denominator state for next update
    const denominator = (0, readBig_1.readBigInt64LE)(data, 16);
    return { valueComponent, value, numerator, denominator };
};
