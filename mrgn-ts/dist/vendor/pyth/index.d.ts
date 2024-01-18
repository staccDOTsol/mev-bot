/// <reference types="node" />
import { PublicKey } from "@solana/web3.js";
/** Number of slots that can pass before a publisher's price is no longer included in the aggregate. */
export declare const MAX_SLOT_DIFFERENCE = 25;
export interface Price {
    priceComponent: bigint;
    price: number;
    confidenceComponent: bigint;
    confidence: number;
    status: PriceStatus;
    corporateAction: CorpAction;
    publishSlot: number;
}
export declare enum PriceStatus {
    Unknown = 0,
    Trading = 1,
    Halted = 2,
    Auction = 3,
    Ignored = 4
}
export declare enum CorpAction {
    NoCorpAct = 0
}
export interface PriceData extends Base {
    priceType: PriceType;
    exponent: number;
    numComponentPrices: number;
    numQuoters: number;
    lastSlot: bigint;
    validSlot: bigint;
    emaPrice: Ema;
    emaConfidence: Ema;
    timestamp: bigint;
    minPublishers: number;
    drv2: number;
    drv3: number;
    drv4: number;
    productAccountKey: PublicKey;
    nextPriceAccountKey: PublicKey | null;
    previousSlot: bigint;
    previousPriceComponent: bigint;
    previousPrice: number;
    previousConfidenceComponent: bigint;
    previousConfidence: number;
    previousTimestamp: bigint;
    priceComponents: PriceComponent[];
    aggregate: Price;
    price: number | undefined;
    confidence: number | undefined;
    status: PriceStatus;
}
export interface Base {
    magic: number;
    version: number;
    type: AccountType;
    size: number;
}
export declare enum AccountType {
    Unknown = 0,
    Mapping = 1,
    Product = 2,
    Price = 3,
    Test = 4,
    Permission = 5
}
export declare enum PriceType {
    Unknown = 0,
    Price = 1
}
/**
 * valueComponent = numerator / denominator
 * value = valueComponent * 10 ^ exponent (from PriceData)
 */
export interface Ema {
    valueComponent: bigint;
    value: number;
    numerator: bigint;
    denominator: bigint;
}
export interface PriceComponent {
    publisher: PublicKey;
    aggregate: Price;
    latest: Price;
}
export declare const parsePriceData: (data: Buffer, currentSlot?: number) => PriceData;
//# sourceMappingURL=index.d.ts.map