"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseOracleSetup = exports.parseRiskTier = exports.OracleSetup = exports.OperationalState = exports.RiskTier = exports.BankConfig = exports.Bank = void 0;
const mrgn_common_1 = require("@mrgnlabs/mrgn-common");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const account_1 = require("./account");
const price_1 = require("./price");
const anchor_1 = require("@coral-xyz/anchor");
const types_1 = require("../types");
const idl_1 = require("../idl");
const SECONDS_PER_DAY = 24 * 60 * 60;
const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365.25;
// ----------------------------------------------------------------------------
// Client types
// ----------------------------------------------------------------------------
class Bank {
    constructor(address, mint, mintDecimals, group, assetShareValue, liabilityShareValue, liquidityVault, liquidityVaultBump, liquidityVaultAuthorityBump, insuranceVault, insuranceVaultBump, insuranceVaultAuthorityBump, collectedInsuranceFeesOutstanding, feeVault, feeVaultBump, feeVaultAuthorityBump, collectedGroupFeesOutstanding, lastUpdate, config, totalAssetShares, totalLiabilityShares, emissionsActiveBorrowing, emissionsActiveLending, emissionsRate, emissionsMint, emissionsRemaining, tokenSymbol) {
        this.address = address;
        this.tokenSymbol = tokenSymbol;
        this.group = group;
        this.mint = mint;
        this.mintDecimals = mintDecimals;
        this.assetShareValue = assetShareValue;
        this.liabilityShareValue = liabilityShareValue;
        this.liquidityVault = liquidityVault;
        this.liquidityVaultBump = liquidityVaultBump;
        this.liquidityVaultAuthorityBump = liquidityVaultAuthorityBump;
        this.insuranceVault = insuranceVault;
        this.insuranceVaultBump = insuranceVaultBump;
        this.insuranceVaultAuthorityBump = insuranceVaultAuthorityBump;
        this.collectedInsuranceFeesOutstanding = collectedInsuranceFeesOutstanding;
        this.feeVault = feeVault;
        this.feeVaultBump = feeVaultBump;
        this.feeVaultAuthorityBump = feeVaultAuthorityBump;
        this.collectedGroupFeesOutstanding = collectedGroupFeesOutstanding;
        this.lastUpdate = lastUpdate.toNumber();
        this.config = config;
        this.totalAssetShares = totalAssetShares;
        this.totalLiabilityShares = totalLiabilityShares;
        this.emissionsActiveBorrowing = emissionsActiveBorrowing;
        this.emissionsActiveLending = emissionsActiveLending;
        this.emissionsRate = emissionsRate;
        this.emissionsMint = emissionsMint;
        this.emissionsRemaining = emissionsRemaining;
    }
    static decodeBankRaw(encoded) {
        const coder = new anchor_1.BorshCoder(idl_1.MARGINFI_IDL);
        return coder.accounts.decode(types_1.AccountType.Bank, encoded);
    }
    static fromBuffer(address, buffer) {
        const accountParsed = Bank.decodeBankRaw(buffer);
        return Bank.fromAccountParsed(address, accountParsed);
    }
    static fromAccountParsed(address, accountParsed, bankMetadata) {
        const emissionsFlags = accountParsed.emissionsFlags.toNumber();
        const mint = accountParsed.mint;
        const mintDecimals = accountParsed.mintDecimals;
        const group = accountParsed.group;
        const assetShareValue = (0, mrgn_common_1.wrappedI80F48toBigNumber)(accountParsed.assetShareValue);
        const liabilityShareValue = (0, mrgn_common_1.wrappedI80F48toBigNumber)(accountParsed.liabilityShareValue);
        const liquidityVault = accountParsed.liquidityVault;
        const liquidityVaultBump = accountParsed.liquidityVaultBump;
        const liquidityVaultAuthorityBump = accountParsed.liquidityVaultAuthorityBump;
        const insuranceVault = accountParsed.insuranceVault;
        const insuranceVaultBump = accountParsed.insuranceVaultBump;
        const insuranceVaultAuthorityBump = accountParsed.insuranceVaultAuthorityBump;
        const collectedInsuranceFeesOutstanding = (0, mrgn_common_1.wrappedI80F48toBigNumber)(accountParsed.collectedInsuranceFeesOutstanding);
        const feeVault = accountParsed.feeVault;
        const feeVaultBump = accountParsed.feeVaultBump;
        const feeVaultAuthorityBump = accountParsed.feeVaultAuthorityBump;
        const collectedGroupFeesOutstanding = (0, mrgn_common_1.wrappedI80F48toBigNumber)(accountParsed.collectedGroupFeesOutstanding);
        const config = BankConfig.fromAccountParsed(accountParsed.config);
        const totalAssetShares = (0, mrgn_common_1.wrappedI80F48toBigNumber)(accountParsed.totalAssetShares);
        const totalLiabilityShares = (0, mrgn_common_1.wrappedI80F48toBigNumber)(accountParsed.totalLiabilityShares);
        const emissionsActiveBorrowing = (emissionsFlags & 1) > 0;
        const emissionsActiveLending = (emissionsFlags & 2) > 0;
        // @todo existence checks here should be temporary - remove once all banks have emission configs
        const emissionsRate = accountParsed.emissionsRate.toNumber();
        const emissionsMint = accountParsed.emissionsMint;
        const emissionsRemaining = accountParsed.emissionsRemaining
            ? (0, mrgn_common_1.wrappedI80F48toBigNumber)(accountParsed.emissionsRemaining)
            : new bignumber_js_1.default(0);
        return new Bank(address, mint, mintDecimals, group, assetShareValue, liabilityShareValue, liquidityVault, liquidityVaultBump, liquidityVaultAuthorityBump, insuranceVault, insuranceVaultBump, insuranceVaultAuthorityBump, collectedInsuranceFeesOutstanding, feeVault, feeVaultBump, feeVaultAuthorityBump, collectedGroupFeesOutstanding, accountParsed.lastUpdate, config, totalAssetShares, totalLiabilityShares, emissionsActiveBorrowing, emissionsActiveLending, emissionsRate, emissionsMint, emissionsRemaining, bankMetadata?.tokenSymbol);
    }
    getTotalAssetQuantity() {
        return this.totalAssetShares.times(this.assetShareValue);
    }
    getTotalLiabilityQuantity() {
        return this.totalLiabilityShares.times(this.liabilityShareValue);
    }
    getAssetQuantity(assetShares) {
        return assetShares.times(this.assetShareValue);
    }
    getLiabilityQuantity(liabilityShares) {
        return liabilityShares.times(this.liabilityShareValue);
    }
    getAssetShares(assetQuantity) {
        return assetQuantity.times(this.assetShareValue);
    }
    getLiabilityShares(liabilityQuantity) {
        return liabilityQuantity.times(this.liabilityShareValue);
    }
    computeAssetUsdValue(oraclePrice, assetShares, marginRequirementType, priceBias) {
        const assetQuantity = this.getAssetQuantity(assetShares);
        const assetWeight = this.getAssetWeight(marginRequirementType, oraclePrice);
        const isWeighted = (0, account_1.isWeightedPrice)(marginRequirementType);
        return this.computeUsdValue(oraclePrice, assetQuantity, priceBias, isWeighted, assetWeight);
    }
    computeLiabilityUsdValue(oraclePrice, liabilityShares, marginRequirementType, priceBias) {
        const liabilityQuantity = this.getLiabilityQuantity(liabilityShares);
        const liabilityWeight = this.getLiabilityWeight(marginRequirementType);
        const isWeighted = (0, account_1.isWeightedPrice)(marginRequirementType);
        return this.computeUsdValue(oraclePrice, liabilityQuantity, priceBias, isWeighted, liabilityWeight);
    }
    computeUsdValue(oraclePrice, quantity, priceBias, weightedPrice, weight, scaleToBase = true) {
        const price = this.getPrice(oraclePrice, priceBias, weightedPrice);
        return quantity
            .times(price)
            .times(weight ?? 1)
            .dividedBy(scaleToBase ? 10 ** this.mintDecimals : 1);
    }
    computeQuantityFromUsdValue(oraclePrice, usdValue, priceBias, weightedPrice) {
        const price = this.getPrice(oraclePrice, priceBias, weightedPrice);
        return usdValue.div(price);
    }
    getPrice(oraclePrice, priceBias = price_1.PriceBias.None, weightedPrice = false) {
        const price = (0, price_1.getPriceWithConfidence)(oraclePrice, weightedPrice);
        switch (priceBias) {
            case price_1.PriceBias.Lowest:
                return price.lowestPrice;
            case price_1.PriceBias.Highest:
                return price.highestPrice;
            case price_1.PriceBias.None:
                return price.price;
        }
    }
    getAssetWeight(marginRequirementType, oraclePrice, ignoreSoftLimits = false) {
        switch (marginRequirementType) {
            case account_1.MarginRequirementType.Initial:
                if (ignoreSoftLimits)
                    return this.config.assetWeightInit;
                const totalBankCollateralValue = this.computeAssetUsdValue(oraclePrice, this.totalAssetShares, account_1.MarginRequirementType.Equity, price_1.PriceBias.Lowest);
                if (totalBankCollateralValue.isGreaterThan(this.config.totalAssetValueInitLimit)) {
                    return this.config.totalAssetValueInitLimit.div(totalBankCollateralValue).times(this.config.assetWeightInit);
                }
                else {
                    return this.config.assetWeightInit;
                }
            case account_1.MarginRequirementType.Maintenance:
                return this.config.assetWeightMaint;
            case account_1.MarginRequirementType.Equity:
                return new bignumber_js_1.default(1);
            default:
                throw new Error("Invalid margin requirement type");
        }
    }
    getEffectiveAssetWeight(marginRequirementType, oraclePrice) {
        switch (marginRequirementType) {
            case account_1.MarginRequirementType.Initial:
                const totalBankCollateralValue = this.computeAssetUsdValue(oraclePrice, this.totalAssetShares, account_1.MarginRequirementType.Equity, price_1.PriceBias.Lowest);
                if (totalBankCollateralValue.isGreaterThan(this.config.totalAssetValueInitLimit)) {
                    return this.config.totalAssetValueInitLimit.div(totalBankCollateralValue).times(this.config.assetWeightInit);
                }
                else {
                    return this.config.assetWeightInit;
                }
            case account_1.MarginRequirementType.Maintenance:
                return this.config.assetWeightMaint;
            case account_1.MarginRequirementType.Equity:
                return new bignumber_js_1.default(1);
            default:
                throw new Error("Invalid margin requirement type");
        }
    }
    getLiabilityWeight(marginRequirementType) {
        switch (marginRequirementType) {
            case account_1.MarginRequirementType.Initial:
                return this.config.liabilityWeightInit;
            case account_1.MarginRequirementType.Maintenance:
                return this.config.liabilityWeightMaint;
            case account_1.MarginRequirementType.Equity:
                return new bignumber_js_1.default(1);
            default:
                throw new Error("Invalid margin requirement type");
        }
    }
    computeTvl(oraclePrice) {
        return this.computeAssetUsdValue(oraclePrice, this.totalAssetShares, account_1.MarginRequirementType.Equity, price_1.PriceBias.None).minus(this.computeLiabilityUsdValue(oraclePrice, this.totalLiabilityShares, account_1.MarginRequirementType.Equity, price_1.PriceBias.None));
    }
    computeInterestRates() {
        const { insuranceFeeFixedApr, insuranceIrFee, protocolFixedFeeApr, protocolIrFee } = this.config.interestRateConfig;
        const rateFee = insuranceFeeFixedApr.plus(protocolFixedFeeApr);
        const fixedFee = insuranceIrFee.plus(protocolIrFee);
        const baseInterestRate = this.computeBaseInterestRate();
        const utilizationRate = this.computeUtilizationRate();
        const lendingRate = baseInterestRate.times(utilizationRate);
        const borrowingRate = baseInterestRate.times(new bignumber_js_1.default(1).plus(rateFee)).plus(fixedFee);
        return { lendingRate, borrowingRate };
    }
    computeBaseInterestRate() {
        const { optimalUtilizationRate, plateauInterestRate, maxInterestRate } = this.config.interestRateConfig;
        const utilizationRate = this.computeUtilizationRate();
        if (utilizationRate.lte(optimalUtilizationRate)) {
            return utilizationRate.times(plateauInterestRate).div(optimalUtilizationRate);
        }
        else {
            return utilizationRate
                .minus(optimalUtilizationRate)
                .div(new bignumber_js_1.default(1).minus(optimalUtilizationRate))
                .times(maxInterestRate.minus(plateauInterestRate))
                .plus(plateauInterestRate);
        }
    }
    computeUtilizationRate() {
        const assets = this.getTotalAssetQuantity();
        const liabilities = this.getTotalLiabilityQuantity();
        if (assets.isZero())
            return new bignumber_js_1.default(0);
        return liabilities.div(assets);
    }
    computeRemainingCapacity() {
        const totalDeposits = this.getTotalAssetQuantity();
        const remainingCapacity = bignumber_js_1.default.max(0, this.config.depositLimit.minus(totalDeposits));
        const totalBorrows = this.getTotalLiabilityQuantity();
        const remainingBorrowCapacity = bignumber_js_1.default.max(0, this.config.borrowLimit.minus(totalBorrows));
        const durationSinceLastAccrual = Date.now() / 1000 - this.lastUpdate;
        const { lendingRate, borrowingRate } = this.computeInterestRates();
        const outstandingLendingInterest = lendingRate
            .times(durationSinceLastAccrual)
            .dividedBy(SECONDS_PER_YEAR)
            .times(totalDeposits);
        const outstandingBorrowInterest = borrowingRate
            .times(durationSinceLastAccrual)
            .dividedBy(SECONDS_PER_YEAR)
            .times(totalBorrows);
        const depositCapacity = remainingCapacity.minus(outstandingLendingInterest.times(2));
        const borrowCapacity = remainingBorrowCapacity.minus(outstandingBorrowInterest.times(2));
        return {
            depositCapacity,
            borrowCapacity,
        };
    }
    describe(oraclePrice) {
        return `
Bank address: ${this.address.toBase58()}
Mint: ${this.mint.toBase58()}, decimals: ${this.mintDecimals}

Total deposits: ${(0, mrgn_common_1.nativeToUi)(this.getTotalAssetQuantity(), this.mintDecimals)}
Total borrows: ${(0, mrgn_common_1.nativeToUi)(this.getTotalLiabilityQuantity(), this.mintDecimals)}

Total assets (USD value): ${this.computeAssetUsdValue(oraclePrice, this.totalAssetShares, account_1.MarginRequirementType.Equity, price_1.PriceBias.None)}
Total liabilities (USD value): ${this.computeLiabilityUsdValue(oraclePrice, this.totalLiabilityShares, account_1.MarginRequirementType.Equity, price_1.PriceBias.None)}

Asset price (USD): ${this.getPrice(oraclePrice, price_1.PriceBias.None, false)}
Asset price Weighted (USD): ${this.getPrice(oraclePrice, price_1.PriceBias.None, true)}

Config:
- Asset weight init: ${this.config.assetWeightInit.toFixed(2)}
- Asset weight maint: ${this.config.assetWeightMaint.toFixed(2)}
- Liability weight init: ${this.config.liabilityWeightInit.toFixed(2)}
- Liability weight maint: ${this.config.liabilityWeightMaint.toFixed(2)}

- Deposit limit: ${this.config.depositLimit}
- Borrow limit: ${this.config.borrowLimit}

LTVs:
- Initial: ${new bignumber_js_1.default(1).div(this.config.liabilityWeightInit).times(100).toFixed(2)}%
- Maintenance: ${new bignumber_js_1.default(1).div(this.config.liabilityWeightMaint).times(100).toFixed(2)}%
`;
    }
}
exports.Bank = Bank;
class BankConfig {
    constructor(assetWeightInit, assetWeightMaint, liabilityWeightInit, liabilityWeightMaint, depositLimit, borrowLimit, riskTier, totalAssetValueInitLimit, oracleSetup, oracleKeys, interestRateConfig, operationalState) {
        this.assetWeightInit = assetWeightInit;
        this.assetWeightMaint = assetWeightMaint;
        this.liabilityWeightInit = liabilityWeightInit;
        this.liabilityWeightMaint = liabilityWeightMaint;
        this.depositLimit = depositLimit;
        this.borrowLimit = borrowLimit;
        this.riskTier = riskTier;
        this.totalAssetValueInitLimit = totalAssetValueInitLimit;
        this.oracleSetup = oracleSetup;
        this.oracleKeys = oracleKeys;
        this.interestRateConfig = interestRateConfig;
        this.operationalState = operationalState;
    }
    static fromAccountParsed(bankConfigRaw) {
        const assetWeightInit = (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.assetWeightInit);
        const assetWeightMaint = (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.assetWeightMaint);
        const liabilityWeightInit = (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.liabilityWeightInit);
        const liabilityWeightMaint = (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.liabilityWeightMaint);
        const depositLimit = (0, bignumber_js_1.default)(bankConfigRaw.depositLimit.toString());
        const borrowLimit = (0, bignumber_js_1.default)(bankConfigRaw.borrowLimit.toString());
        const riskTier = parseRiskTier(bankConfigRaw.riskTier);
        const operationalState = parseOperationalState(bankConfigRaw.operationalState);
        const totalAssetValueInitLimit = (0, bignumber_js_1.default)(bankConfigRaw.totalAssetValueInitLimit.toString());
        const oracleSetup = parseOracleSetup(bankConfigRaw.oracleSetup);
        const oracleKeys = bankConfigRaw.oracleKeys;
        const interestRateConfig = {
            insuranceFeeFixedApr: (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.interestRateConfig.insuranceFeeFixedApr),
            maxInterestRate: (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.interestRateConfig.maxInterestRate),
            insuranceIrFee: (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.interestRateConfig.insuranceIrFee),
            optimalUtilizationRate: (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.interestRateConfig.optimalUtilizationRate),
            plateauInterestRate: (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.interestRateConfig.plateauInterestRate),
            protocolFixedFeeApr: (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.interestRateConfig.protocolFixedFeeApr),
            protocolIrFee: (0, mrgn_common_1.wrappedI80F48toBigNumber)(bankConfigRaw.interestRateConfig.protocolIrFee),
        };
        return {
            assetWeightInit,
            assetWeightMaint,
            liabilityWeightInit,
            liabilityWeightMaint,
            depositLimit,
            borrowLimit,
            riskTier,
            operationalState,
            totalAssetValueInitLimit,
            oracleSetup,
            oracleKeys,
            interestRateConfig,
        };
    }
}
exports.BankConfig = BankConfig;
var RiskTier;
(function (RiskTier) {
    RiskTier["Collateral"] = "Collateral";
    RiskTier["Isolated"] = "Isolated";
})(RiskTier || (RiskTier = {}));
exports.RiskTier = RiskTier;
var OperationalState;
(function (OperationalState) {
    OperationalState["Paused"] = "Paused";
    OperationalState["Operational"] = "Operational";
    OperationalState["ReduceOnly"] = "ReduceOnly";
})(OperationalState || (OperationalState = {}));
exports.OperationalState = OperationalState;
var OracleSetup;
(function (OracleSetup) {
    OracleSetup[OracleSetup["None"] = 0] = "None";
    OracleSetup[OracleSetup["PythEma"] = 1] = "PythEma";
    OracleSetup[OracleSetup["SwitchboardV2"] = 2] = "SwitchboardV2";
})(OracleSetup || (OracleSetup = {}));
exports.OracleSetup = OracleSetup;
function parseRiskTier(riskTierRaw) {
    switch (Object.keys(riskTierRaw)[0].toLowerCase()) {
        case "collateral":
            return RiskTier.Collateral;
        case "isolated":
            return RiskTier.Isolated;
        default:
            throw new Error(`Invalid risk tier "${riskTierRaw}"`);
    }
}
exports.parseRiskTier = parseRiskTier;
function parseOperationalState(operationalStateRaw) {
    switch (Object.keys(operationalStateRaw)[0].toLowerCase()) {
        case "paused":
            return OperationalState.Paused;
        case "operational":
            return OperationalState.Operational;
        case "reduceonly":
            return OperationalState.ReduceOnly;
        default:
            throw new Error(`Invalid operational state "${operationalStateRaw}"`);
    }
}
function parseOracleSetup(oracleSetupRaw) {
    switch (Object.keys(oracleSetupRaw)[0].toLowerCase()) {
        case "none":
            return OracleSetup.None;
        case "pythema":
            return OracleSetup.PythEma;
        case "switchboardv2":
            return OracleSetup.SwitchboardV2;
        default:
            throw new Error(`Invalid oracle setup "${oracleSetupRaw}"`);
    }
}
exports.parseOracleSetup = parseOracleSetup;
// ----------------------------------------------------------------------------
// Attributes
// ----------------------------------------------------------------------------
