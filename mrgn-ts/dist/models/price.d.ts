/// <reference types="node" />
import BigNumber from "bignumber.js";
import { OracleSetup } from "./bank";
interface PriceWithConfidence {
    price: BigNumber;
    confidence: BigNumber;
    lowestPrice: BigNumber;
    highestPrice: BigNumber;
}
interface OraclePrice {
    priceRealtime: PriceWithConfidence;
    priceWeighted: PriceWithConfidence;
}
declare enum PriceBias {
    Lowest = 0,
    None = 1,
    Highest = 2
}
declare function parseOraclePriceData(oracleSetup: OracleSetup, rawData: Buffer): OraclePrice;
export declare function getPriceWithConfidence(oraclePrice: OraclePrice, weighted: boolean): PriceWithConfidence;
export { parseOraclePriceData as parsePriceInfo, PriceBias };
export type { OraclePrice };
//# sourceMappingURL=price.d.ts.map