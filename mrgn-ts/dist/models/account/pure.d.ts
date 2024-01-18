/// <reference types="node" />
import { Amount, InstructionsWrapper } from "@mrgnlabs/mrgn-common";
import { AccountMeta, PublicKey, TransactionInstruction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { Bank } from "../bank";
import { OraclePrice } from "../price";
import { MarginfiProgram } from "../../types";
import { Balance, BalanceRaw } from "../balance";
import { BankMap, MarginfiClient, OraclePriceMap } from "../..";
import BN from "bn.js";
import { Address } from "@coral-xyz/anchor";
interface MarginfiAccountRaw {
    group: PublicKey;
    authority: PublicKey;
    lendingAccount: {
        balances: BalanceRaw[];
    };
    accountFlags: BN;
}
type MarginRequirementTypeRaw = {
    initial: {};
} | {
    maintenance: {};
} | {
    equity: {};
};
export type { MarginfiAccountRaw, MarginRequirementTypeRaw };
declare class MarginfiAccount {
    address: PublicKey;
    group: PublicKey;
    authority: PublicKey;
    balances: Balance[];
    private accountFlags;
    constructor(address: PublicKey, marginfiAccountRaw: MarginfiAccountRaw);
    static fetch(address: PublicKey, client: MarginfiClient): Promise<MarginfiAccount>;
    static decode(encoded: Buffer): MarginfiAccountRaw;
    static fromAccountParsed(marginfiAccountPk: Address, accountData: MarginfiAccountRaw): MarginfiAccount;
    static fromAccountDataRaw(marginfiAccountPk: PublicKey, marginfiAccountRawData: Buffer): MarginfiAccount;
    get activeBalances(): Balance[];
    getBalance(bankPk: PublicKey): Balance;
    get isDisabled(): boolean;
    get isFlashLoanEnabled(): boolean;
    computeFreeCollateral(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, opts?: {
        clamped?: boolean;
    }): BigNumber;
    computeHealthComponents(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, marginReqType: MarginRequirementType, excludedBanks?: PublicKey[]): {
        assets: BigNumber;
        liabilities: BigNumber;
    };
    computeHealthComponentsWithoutBias(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, marginReqType: MarginRequirementType): {
        assets: BigNumber;
        liabilities: BigNumber;
    };
    computeAccountValue(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>): BigNumber;
    computeNetApy(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>): number;
    /**
     * Calculate the maximum amount of asset that can be withdrawn from a bank given existing deposits of the asset
     * and the untied collateral of the margin account.
     *
     * fc = free collateral
     * ucb = untied collateral for bank
     *
     * q = (min(fc, ucb) / (price_lowest_bias * deposit_weight)) + (fc - min(fc, ucb)) / (price_highest_bias * liab_weight)
     *
     *
     *
     * NOTE FOR LIQUIDATORS
     * This function doesn't take into account the collateral received when liquidating an account.
     */
    computeMaxBorrowForBank(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, bankAddress: PublicKey, opts?: {
        volatilityFactor?: number;
    }): BigNumber;
    /**
     * Calculate the maximum amount that can be withdrawn form a bank without borrowing.
     */
    computeMaxWithdrawForBank(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, bankAddress: PublicKey, opts?: {
        volatilityFactor?: number;
    }): BigNumber;
    /**
     * Calculate the price at which the user position for the given bank will lead to liquidation, all other prices constant.
     */
    computeLiquidationPriceForBank(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, bankAddress: PublicKey): number | null;
    /**
     * Calculate the price at which the user position for the given bank and amount will lead to liquidation, all other prices constant.
     */
    computeLiquidationPriceForBankAmount(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, bankAddress: PublicKey, isLending: boolean, amount: number): number | null;
    computeMaxLiquidatableAssetAmount(banks: Map<string, Bank>, oraclePrices: Map<string, OraclePrice>, assetBankAddress: PublicKey, liabilityBankAddress: PublicKey): BigNumber;
    getHealthCheckAccounts(banks: Map<string, Bank>, mandatoryBanks?: Bank[], excludedBanks?: Bank[]): AccountMeta[];
    makeDepositIx(program: MarginfiProgram, banks: Map<string, Bank>, amount: Amount, bankAddress: PublicKey): Promise<InstructionsWrapper>;
    makeRepayIx(program: MarginfiProgram, banks: Map<string, Bank>, amount: Amount, bankAddress: PublicKey, repayAll?: boolean): Promise<InstructionsWrapper>;
    makeWithdrawIx(program: MarginfiProgram, banks: Map<string, Bank>, amount: Amount, bankAddress: PublicKey, withdrawAll?: boolean): Promise<InstructionsWrapper>;
    makeBorrowIx(program: MarginfiProgram, banks: Map<string, Bank>, amount: Amount, bankAddress: PublicKey, opt?: {
        remainingAccountsBankOverride?: Bank[];
    } | undefined): Promise<InstructionsWrapper>;
    makeWithdrawEmissionsIx(program: MarginfiProgram, banks: Map<string, Bank>, bankAddress: PublicKey): Promise<InstructionsWrapper>;
    makeLendingAccountLiquidateIx(liquidateeMarginfiAccount: MarginfiAccount, program: MarginfiProgram, banks: Map<string, Bank>, assetBankAddress: PublicKey, assetQuantityUi: Amount, liabilityBankAddress: PublicKey): Promise<InstructionsWrapper>;
    makeBeginFlashLoanIx(program: MarginfiProgram, endIndex: number): Promise<InstructionsWrapper>;
    makeEndFlashLoanIx(program: MarginfiProgram, banks: Map<string, Bank>): Promise<InstructionsWrapper>;
    wrapInstructionForWSol(ix: TransactionInstruction, amount?: Amount): TransactionInstruction[];
    describe(banks: BankMap, oraclePrices: OraclePriceMap): string;
}
declare enum MarginRequirementType {
    Initial = 0,
    Maintenance = 1,
    Equity = 2
}
export declare function isWeightedPrice(reqType: MarginRequirementType): boolean;
export { MarginfiAccount, MarginRequirementType };
//# sourceMappingURL=pure.d.ts.map