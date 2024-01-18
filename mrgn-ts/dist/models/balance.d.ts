import { WrappedI80F48 } from "@mrgnlabs/mrgn-common";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { OraclePrice, MarginRequirementType } from "..";
import { Bank } from "./bank";
import BN from "bn.js";
interface BalanceRaw {
    active: boolean;
    bankPk: PublicKey;
    assetShares: WrappedI80F48;
    liabilityShares: WrappedI80F48;
    emissionsOutstanding: WrappedI80F48;
    lastUpdate: BN;
}
export type { BalanceRaw };
declare class Balance {
    active: boolean;
    bankPk: PublicKey;
    assetShares: BigNumber;
    liabilityShares: BigNumber;
    emissionsOutstanding: BigNumber;
    lastUpdate: number;
    constructor(active: boolean, bankPk: PublicKey, assetShares: BigNumber, liabilityShares: BigNumber, emissionsOutstanding: BigNumber, lastUpdate: number);
    static from(balanceRaw: BalanceRaw): Balance;
    static createEmpty(bankPk: PublicKey): Balance;
    computeUsdValue(bank: Bank, oraclePrice: OraclePrice, marginRequirementType?: MarginRequirementType): {
        assets: BigNumber;
        liabilities: BigNumber;
    };
    getUsdValueWithPriceBias(bank: Bank, oraclePrice: OraclePrice, marginRequirementType?: MarginRequirementType): {
        assets: BigNumber;
        liabilities: BigNumber;
    };
    computeQuantity(bank: Bank): {
        assets: BigNumber;
        liabilities: BigNumber;
    };
    computeQuantityUi(bank: Bank): {
        assets: BigNumber;
        liabilities: BigNumber;
    };
    computeTotalOutstandingEmissions(bank: Bank): BigNumber;
    computeClaimedEmissions(bank: Bank, currentTimestamp: number): BigNumber;
    describe(bank: Bank, oraclePrice: OraclePrice): string;
}
export { Balance };
//# sourceMappingURL=balance.d.ts.map