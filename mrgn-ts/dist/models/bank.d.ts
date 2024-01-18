/// <reference types="node" />
import { BankMetadata, WrappedI80F48 } from "@mrgnlabs/mrgn-common";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import { MarginRequirementType } from "./account";
import { PriceBias, OraclePrice } from "./price";
interface BankRaw {
    mint: PublicKey;
    mintDecimals: number;
    group: PublicKey;
    assetShareValue: WrappedI80F48;
    liabilityShareValue: WrappedI80F48;
    liquidityVault: PublicKey;
    liquidityVaultBump: number;
    liquidityVaultAuthorityBump: number;
    insuranceVault: PublicKey;
    insuranceVaultBump: number;
    insuranceVaultAuthorityBump: number;
    collectedInsuranceFeesOutstanding: WrappedI80F48;
    feeVault: PublicKey;
    feeVaultBump: number;
    feeVaultAuthorityBump: number;
    collectedGroupFeesOutstanding: WrappedI80F48;
    totalLiabilityShares: WrappedI80F48;
    totalAssetShares: WrappedI80F48;
    lastUpdate: BN;
    config: BankConfigRaw;
    emissionsFlags: BN;
    emissionsRate: BN;
    emissionsMint: PublicKey;
    emissionsRemaining: WrappedI80F48;
}
interface BankConfigRaw {
    assetWeightInit: WrappedI80F48;
    assetWeightMaint: WrappedI80F48;
    liabilityWeightInit: WrappedI80F48;
    liabilityWeightMaint: WrappedI80F48;
    depositLimit: BN;
    borrowLimit: BN;
    riskTier: RiskTierRaw;
    totalAssetValueInitLimit: BN;
    interestRateConfig: InterestRateConfigRaw;
    operationalState: OperationalStateRaw;
    oracleSetup: OracleSetupRaw;
    oracleKeys: PublicKey[];
}
type RiskTierRaw = {
    collateral: {};
} | {
    isolated: {};
};
type OperationalStateRaw = number;
interface InterestRateConfigRaw {
    optimalUtilizationRate: WrappedI80F48;
    plateauInterestRate: WrappedI80F48;
    maxInterestRate: WrappedI80F48;
    insuranceFeeFixedApr: WrappedI80F48;
    insuranceIrFee: WrappedI80F48;
    protocolFixedFeeApr: WrappedI80F48;
    protocolIrFee: WrappedI80F48;
}
type OracleSetupRaw = number;
export type { BankRaw, BankConfigRaw, RiskTierRaw, InterestRateConfigRaw, OracleSetupRaw };
declare class Bank {
    address: PublicKey;
    tokenSymbol: string | undefined;
    group: PublicKey;
    mint: PublicKey;
    mintDecimals: number;
    assetShareValue: BigNumber;
    liabilityShareValue: BigNumber;
    liquidityVault: PublicKey;
    liquidityVaultBump: number;
    liquidityVaultAuthorityBump: number;
    insuranceVault: PublicKey;
    insuranceVaultBump: number;
    insuranceVaultAuthorityBump: number;
    collectedInsuranceFeesOutstanding: BigNumber;
    feeVault: PublicKey;
    feeVaultBump: number;
    feeVaultAuthorityBump: number;
    collectedGroupFeesOutstanding: BigNumber;
    lastUpdate: number;
    config: BankConfig;
    totalAssetShares: BigNumber;
    totalLiabilityShares: BigNumber;
    emissionsActiveBorrowing: boolean;
    emissionsActiveLending: boolean;
    emissionsRate: number;
    emissionsMint: PublicKey;
    emissionsRemaining: BigNumber;
    constructor(address: PublicKey, mint: PublicKey, mintDecimals: number, group: PublicKey, assetShareValue: BigNumber, liabilityShareValue: BigNumber, liquidityVault: PublicKey, liquidityVaultBump: number, liquidityVaultAuthorityBump: number, insuranceVault: PublicKey, insuranceVaultBump: number, insuranceVaultAuthorityBump: number, collectedInsuranceFeesOutstanding: BigNumber, feeVault: PublicKey, feeVaultBump: number, feeVaultAuthorityBump: number, collectedGroupFeesOutstanding: BigNumber, lastUpdate: BN, config: BankConfig, totalAssetShares: BigNumber, totalLiabilityShares: BigNumber, emissionsActiveBorrowing: boolean, emissionsActiveLending: boolean, emissionsRate: number, emissionsMint: PublicKey, emissionsRemaining: BigNumber, tokenSymbol?: string);
    static decodeBankRaw(encoded: Buffer): BankRaw;
    static fromBuffer(address: PublicKey, buffer: Buffer): Bank;
    static fromAccountParsed(address: PublicKey, accountParsed: BankRaw, bankMetadata?: BankMetadata): Bank;
    getTotalAssetQuantity(): BigNumber;
    getTotalLiabilityQuantity(): BigNumber;
    getAssetQuantity(assetShares: BigNumber): BigNumber;
    getLiabilityQuantity(liabilityShares: BigNumber): BigNumber;
    getAssetShares(assetQuantity: BigNumber): BigNumber;
    getLiabilityShares(liabilityQuantity: BigNumber): BigNumber;
    computeAssetUsdValue(oraclePrice: OraclePrice, assetShares: BigNumber, marginRequirementType: MarginRequirementType, priceBias: PriceBias): BigNumber;
    computeLiabilityUsdValue(oraclePrice: OraclePrice, liabilityShares: BigNumber, marginRequirementType: MarginRequirementType, priceBias: PriceBias): BigNumber;
    computeUsdValue(oraclePrice: OraclePrice, quantity: BigNumber, priceBias: PriceBias, weightedPrice: boolean, weight?: BigNumber, scaleToBase?: boolean): BigNumber;
    computeQuantityFromUsdValue(oraclePrice: OraclePrice, usdValue: BigNumber, priceBias: PriceBias, weightedPrice: boolean): BigNumber;
    getPrice(oraclePrice: OraclePrice, priceBias?: PriceBias, weightedPrice?: boolean): BigNumber;
    getAssetWeight(marginRequirementType: MarginRequirementType, oraclePrice: OraclePrice, ignoreSoftLimits?: boolean): BigNumber;
    getEffectiveAssetWeight(marginRequirementType: MarginRequirementType, oraclePrice: OraclePrice): BigNumber;
    getLiabilityWeight(marginRequirementType: MarginRequirementType): BigNumber;
    computeTvl(oraclePrice: OraclePrice): BigNumber;
    computeInterestRates(): {
        lendingRate: BigNumber;
        borrowingRate: BigNumber;
    };
    computeBaseInterestRate(): BigNumber;
    computeUtilizationRate(): BigNumber;
    computeRemainingCapacity(): {
        depositCapacity: BigNumber;
        borrowCapacity: BigNumber;
    };
    describe(oraclePrice: OraclePrice): string;
}
declare class BankConfig {
    assetWeightInit: BigNumber;
    assetWeightMaint: BigNumber;
    liabilityWeightInit: BigNumber;
    liabilityWeightMaint: BigNumber;
    depositLimit: BigNumber;
    borrowLimit: BigNumber;
    riskTier: RiskTier;
    totalAssetValueInitLimit: BigNumber;
    interestRateConfig: InterestRateConfig;
    operationalState: OperationalState;
    oracleSetup: OracleSetup;
    oracleKeys: PublicKey[];
    constructor(assetWeightInit: BigNumber, assetWeightMaint: BigNumber, liabilityWeightInit: BigNumber, liabilityWeightMaint: BigNumber, depositLimit: BigNumber, borrowLimit: BigNumber, riskTier: RiskTier, totalAssetValueInitLimit: BigNumber, oracleSetup: OracleSetup, oracleKeys: PublicKey[], interestRateConfig: InterestRateConfig, operationalState: OperationalState);
    static fromAccountParsed(bankConfigRaw: BankConfigRaw): BankConfig;
}
declare enum RiskTier {
    Collateral = "Collateral",
    Isolated = "Isolated"
}
declare enum OperationalState {
    Paused = "Paused",
    Operational = "Operational",
    ReduceOnly = "ReduceOnly"
}
interface InterestRateConfig {
    optimalUtilizationRate: BigNumber;
    plateauInterestRate: BigNumber;
    maxInterestRate: BigNumber;
    insuranceFeeFixedApr: BigNumber;
    insuranceIrFee: BigNumber;
    protocolFixedFeeApr: BigNumber;
    protocolIrFee: BigNumber;
}
declare enum OracleSetup {
    None = 0,
    PythEma = 1,
    SwitchboardV2 = 2
}
declare function parseRiskTier(riskTierRaw: RiskTierRaw): RiskTier;
declare function parseOracleSetup(oracleSetupRaw: OracleSetupRaw): OracleSetup;
export type { InterestRateConfig };
export { Bank, BankConfig, RiskTier, OperationalState, OracleSetup, parseRiskTier, parseOracleSetup };
//# sourceMappingURL=bank.d.ts.map