"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarginRequirementType = exports.MarginfiAccount = exports.isWeightedPrice = void 0;
const mrgn_common_1 = require("@mrgnlabs/mrgn-common");
const web3_js_1 = require("@solana/web3.js");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const price_1 = require("../price");
const instructions_1 = __importDefault(require("../../instructions"));
const types_1 = require("../../types");
const utils_1 = require("../../utils");
const balance_1 = require("../balance");
const __1 = require("../..");
const bn_js_1 = __importDefault(require("bn.js"));
const anchor_1 = require("@coral-xyz/anchor");
// ----------------------------------------------------------------------------
// Client types
// ----------------------------------------------------------------------------
class MarginfiAccount {
    // ----------------------------------------------------------------------------
    // Factories
    // ----------------------------------------------------------------------------
    constructor(address, marginfiAccountRaw) {
        this.address = address;
        this.group = marginfiAccountRaw.group;
        this.authority = marginfiAccountRaw.authority;
        this.balances = marginfiAccountRaw.lendingAccount.balances.map(balance_1.Balance.from);
        this.accountFlags = marginfiAccountRaw.accountFlags;
    }
    static async fetch(address, client) {
        const data = (await client.program.account.marginfiAccount.fetch(address));
        return new MarginfiAccount(address, data);
    }
    static decode(encoded) {
        const coder = new anchor_1.BorshCoder(__1.MARGINFI_IDL);
        return coder.accounts.decode(types_1.AccountType.MarginfiAccount, encoded);
    }
    static fromAccountParsed(marginfiAccountPk, accountData) {
        const _marginfiAccountPk = (0, anchor_1.translateAddress)(marginfiAccountPk);
        return new MarginfiAccount(_marginfiAccountPk, accountData);
    }
    static fromAccountDataRaw(marginfiAccountPk, marginfiAccountRawData) {
        const marginfiAccountData = MarginfiAccount.decode(marginfiAccountRawData);
        return MarginfiAccount.fromAccountParsed(marginfiAccountPk, marginfiAccountData);
    }
    // ----------------------------------------------------------------------------
    // Attributes
    // ----------------------------------------------------------------------------
    get activeBalances() {
        return this.balances.filter((b) => b.active);
    }
    getBalance(bankPk) {
        return this.activeBalances.find((b) => b.bankPk.equals(bankPk)) ?? balance_1.Balance.createEmpty(bankPk);
    }
    get isDisabled() {
        return (this.accountFlags.toNumber() & __1.DISABLED_FLAG) !== 0;
    }
    get isFlashLoanEnabled() {
        return (this.accountFlags.toNumber() & __1.FLASHLOAN_ENABLED_FLAG) !== 0;
    }
    computeFreeCollateral(banks, oraclePrices, opts) {
        const _clamped = opts?.clamped ?? true;
        const { assets, liabilities } = this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Initial);
        const signedFreeCollateral = assets.minus(liabilities);
        return _clamped ? bignumber_js_1.default.max(0, signedFreeCollateral) : signedFreeCollateral;
    }
    computeHealthComponents(banks, oraclePrices, marginReqType, excludedBanks = []) {
        const filteredBalances = this.activeBalances.filter((accountBalance) => !excludedBanks.find((b) => b.equals(accountBalance.bankPk)));
        const [assets, liabilities] = filteredBalances
            .map((accountBalance) => {
            const bank = banks.get(accountBalance.bankPk.toBase58());
            if (!bank)
                throw Error(`Bank ${(0, mrgn_common_1.shortenAddress)(accountBalance.bankPk)} not found`);
            const priceInfo = oraclePrices.get(accountBalance.bankPk.toBase58());
            if (!priceInfo)
                throw Error(`Bank ${(0, mrgn_common_1.shortenAddress)(accountBalance.bankPk)} not found`);
            const { assets, liabilities } = accountBalance.getUsdValueWithPriceBias(bank, priceInfo, marginReqType);
            return [assets, liabilities];
        })
            .reduce(([asset, liability], [d, l]) => {
            return [asset.plus(d), liability.plus(l)];
        }, [new bignumber_js_1.default(0), new bignumber_js_1.default(0)]);
        return { assets, liabilities };
    }
    computeHealthComponentsWithoutBias(banks, oraclePrices, marginReqType) {
        const [assets, liabilities] = this.activeBalances
            .map((accountBalance) => {
            const bank = banks.get(accountBalance.bankPk.toBase58());
            if (!bank)
                throw Error(`Bank ${(0, mrgn_common_1.shortenAddress)(accountBalance.bankPk)} not found`);
            const priceInfo = oraclePrices.get(accountBalance.bankPk.toBase58());
            if (!priceInfo)
                throw Error(`Bank ${(0, mrgn_common_1.shortenAddress)(accountBalance.bankPk)} not found`);
            const { assets, liabilities } = accountBalance.computeUsdValue(bank, priceInfo, marginReqType);
            return [assets, liabilities];
        })
            .reduce(([asset, liability], [d, l]) => {
            return [asset.plus(d), liability.plus(l)];
        }, [new bignumber_js_1.default(0), new bignumber_js_1.default(0)]);
        return { assets, liabilities };
    }
    computeAccountValue(banks, oraclePrices) {
        const { assets, liabilities } = this.computeHealthComponentsWithoutBias(banks, oraclePrices, MarginRequirementType.Equity);
        return assets.minus(liabilities);
    }
    computeNetApy(banks, oraclePrices) {
        const { assets, liabilities } = this.computeHealthComponentsWithoutBias(banks, oraclePrices, MarginRequirementType.Equity);
        const totalUsdValue = assets.minus(liabilities);
        const apr = this.activeBalances
            .reduce((weightedApr, balance) => {
            const bank = banks.get(balance.bankPk.toBase58());
            if (!bank)
                throw Error(`Bank ${balance.bankPk.toBase58()} not found`);
            const priceInfo = oraclePrices.get(balance.bankPk.toBase58());
            if (!priceInfo)
                throw Error(`Bank ${(0, mrgn_common_1.shortenAddress)(balance.bankPk)} not found`);
            return weightedApr
                .minus(bank
                .computeInterestRates()
                .borrowingRate.times(balance.computeUsdValue(bank, priceInfo, MarginRequirementType.Equity).liabilities)
                .div(totalUsdValue.isEqualTo(0) ? 1 : totalUsdValue))
                .plus(bank
                .computeInterestRates()
                .lendingRate.times(balance.computeUsdValue(bank, priceInfo, MarginRequirementType.Equity).assets)
                .div(totalUsdValue.isEqualTo(0) ? 1 : totalUsdValue));
        }, new bignumber_js_1.default(0))
            .toNumber();
        return (0, mrgn_common_1.aprToApy)(apr);
    }
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
    computeMaxBorrowForBank(banks, oraclePrices, bankAddress, opts) {
        const debug = require("debug")("mfi:computeMaxBorrowForBank");
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        const priceInfo = oraclePrices.get(bankAddress.toBase58());
        if (!priceInfo)
            throw Error(`Price info for ${bankAddress.toBase58()} not found`);
        // -------------------------- //
        // isolated asset constraints //
        // -------------------------- //
        const attemptingToBorrowIsolatedAssetWithActiveDebt = bank.config.riskTier === __1.RiskTier.Isolated &&
            !this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Equity, [
                bankAddress,
            ]).liabilities.isZero();
        debug("attemptingToBorrowIsolatedAssetWithActiveDebt: %s", attemptingToBorrowIsolatedAssetWithActiveDebt);
        const existingLiabilityBanks = this.activeBalances
            .filter((b) => b.liabilityShares.gt(0))
            .map((b) => banks.get(b.bankPk.toBase58()));
        const attemptingToBorrowNewAssetWithExistingIsolatedDebt = existingLiabilityBanks.some((b) => b.config.riskTier === __1.RiskTier.Isolated && !b.address.equals(bankAddress));
        debug("attemptingToBorrowNewAssetWithExistingIsolatedDebt: %s", attemptingToBorrowNewAssetWithExistingIsolatedDebt);
        if (attemptingToBorrowIsolatedAssetWithActiveDebt || attemptingToBorrowNewAssetWithExistingIsolatedDebt) {
            // User can only withdraw
            return this.computeMaxWithdrawForBank(banks, oraclePrices, bankAddress, opts);
        }
        // ------------- //
        // FC-based calc //
        // ------------- //
        const _volatilityFactor = opts?.volatilityFactor ?? 1;
        const balance = this.getBalance(bankAddress);
        const freeCollateral = this.computeFreeCollateral(banks, oraclePrices).times(_volatilityFactor);
        debug("Free collateral: %d", freeCollateral.toFixed(6));
        const untiedCollateralForBank = bignumber_js_1.default.min(bank.computeAssetUsdValue(priceInfo, balance.assetShares, MarginRequirementType.Initial, price_1.PriceBias.Lowest), freeCollateral);
        const priceLowestBias = bank.getPrice(priceInfo, price_1.PriceBias.Lowest, true);
        const priceHighestBias = bank.getPrice(priceInfo, price_1.PriceBias.Highest, true);
        const assetWeight = bank.getAssetWeight(MarginRequirementType.Initial, priceInfo);
        const liabWeight = bank.getLiabilityWeight(MarginRequirementType.Initial);
        if (assetWeight.eq(0)) {
            return balance
                .computeQuantityUi(bank)
                .assets.plus(freeCollateral.minus(untiedCollateralForBank).div(priceHighestBias.times(liabWeight)));
        }
        else {
            return untiedCollateralForBank
                .div(priceLowestBias.times(assetWeight))
                .plus(freeCollateral.minus(untiedCollateralForBank).div(priceHighestBias.times(liabWeight)));
        }
    }
    /**
     * Calculate the maximum amount that can be withdrawn form a bank without borrowing.
     */
    computeMaxWithdrawForBank(banks, oraclePrices, bankAddress, opts) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        const priceInfo = oraclePrices.get(bankAddress.toBase58());
        if (!priceInfo)
            throw Error(`Price info for ${bankAddress.toBase58()} not found`);
        const _volatilityFactor = opts?.volatilityFactor ?? 1;
        const initAssetWeight = bank.getAssetWeight(MarginRequirementType.Initial, priceInfo);
        const maintAssetWeight = bank.getAssetWeight(MarginRequirementType.Maintenance, priceInfo);
        const balance = this.getBalance(bankAddress);
        const freeCollateral = this.computeFreeCollateral(banks, oraclePrices);
        const initCollateralForBank = bank.computeAssetUsdValue(priceInfo, balance.assetShares, MarginRequirementType.Initial, price_1.PriceBias.Lowest);
        const entireBalance = balance.computeQuantityUi(bank).assets;
        const { liabilities: liabilitiesInit } = this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Initial);
        // -------------------------------------------------- //
        // isolated bank (=> init weight = maint weight = 0)  //
        // or collateral bank with 0-weights (does not happen //
        // in practice)                                       //
        // -------------------------------------------------- //
        if (bank.config.riskTier === __1.RiskTier.Isolated || (initAssetWeight.isZero() && maintAssetWeight.isZero())) {
            if (freeCollateral.isZero() && !liabilitiesInit.isZero()) {
                // if account is already below init requirements and has active debt, prevent any withdrawal even if those don't count as collateral
                // inefficient, but reflective of contract which does not look at action delta, but only end state atm
                return new bignumber_js_1.default(0);
            }
            else {
                return entireBalance;
            }
        }
        // ----------------------------- //
        // collateral bank being retired //
        // ----------------------------- //
        if (initAssetWeight.isZero() && !maintAssetWeight.isZero()) {
            if (liabilitiesInit.eq(0)) {
                return entireBalance;
            }
            else if (freeCollateral.isZero()) {
                return new bignumber_js_1.default(0); // inefficient, but reflective of contract which does not look at action delta, but only end state
            }
            else {
                const { liabilities: maintLiabilities, assets: maintAssets } = this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Maintenance);
                const maintUntiedCollateral = maintAssets.minus(maintLiabilities);
                const priceLowestBias = bank.getPrice(priceInfo, price_1.PriceBias.Lowest, true);
                const maintWeightedPrice = priceLowestBias.times(maintAssetWeight);
                return maintUntiedCollateral.div(maintWeightedPrice);
            }
        }
        // ------------------------------------- //
        // collateral bank with positive weights //
        // ------------------------------------- //
        // bypass volatility factor if no liabilities or if all collateral is untied
        if (liabilitiesInit.isZero() || initCollateralForBank.lte(freeCollateral)) {
            return entireBalance;
        }
        // apply volatility factor to avoid failure due to price volatility / slippage
        const initUntiedCollateralForBank = freeCollateral.times(_volatilityFactor);
        const priceLowestBias = bank.getPrice(priceInfo, price_1.PriceBias.Lowest, true);
        const initWeightedPrice = priceLowestBias.times(initAssetWeight);
        const maxWithdraw = initUntiedCollateralForBank.div(initWeightedPrice);
        return maxWithdraw;
    }
    /**
     * Calculate the price at which the user position for the given bank will lead to liquidation, all other prices constant.
     */
    computeLiquidationPriceForBank(banks, oraclePrices, bankAddress) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        const priceInfo = oraclePrices.get(bankAddress.toBase58());
        if (!priceInfo)
            throw Error(`Price info for ${bankAddress.toBase58()} not found`);
        const balance = this.getBalance(bankAddress);
        if (!balance.active)
            return null;
        const isLending = balance.liabilityShares.isZero();
        const { assets, liabilities } = this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Maintenance, [bankAddress]);
        const { assets: assetQuantityUi, liabilities: liabQuantitiesUi } = balance.computeQuantityUi(bank);
        let liquidationPrice;
        if (isLending) {
            if (liabilities.eq(0))
                return null;
            const assetWeight = bank.getAssetWeight(MarginRequirementType.Maintenance, priceInfo);
            const priceConfidence = bank
                .getPrice(priceInfo, price_1.PriceBias.None, false)
                .minus(bank.getPrice(priceInfo, price_1.PriceBias.Lowest, false));
            liquidationPrice = liabilities.minus(assets).div(assetQuantityUi.times(assetWeight)).plus(priceConfidence);
        }
        else {
            const liabWeight = bank.getLiabilityWeight(MarginRequirementType.Maintenance);
            const priceConfidence = bank
                .getPrice(priceInfo, price_1.PriceBias.Highest, false)
                .minus(bank.getPrice(priceInfo, price_1.PriceBias.None, false));
            liquidationPrice = assets.minus(liabilities).div(liabQuantitiesUi.times(liabWeight)).minus(priceConfidence);
        }
        if (liquidationPrice.isNaN() || liquidationPrice.lt(0))
            return null;
        return liquidationPrice.toNumber();
    }
    /**
     * Calculate the price at which the user position for the given bank and amount will lead to liquidation, all other prices constant.
     */
    computeLiquidationPriceForBankAmount(banks, oraclePrices, bankAddress, isLending, amount) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        const priceInfo = oraclePrices.get(bankAddress.toBase58());
        if (!priceInfo)
            throw Error(`Price info for ${bankAddress.toBase58()} not found`);
        const balance = this.getBalance(bankAddress);
        if (!balance.active)
            return null;
        const { assets, liabilities } = this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Maintenance, [bankAddress]);
        const amountBn = new bignumber_js_1.default(amount);
        let liquidationPrice;
        if (isLending) {
            if (liabilities.eq(0))
                return null;
            const assetWeight = bank.getAssetWeight(MarginRequirementType.Maintenance, priceInfo);
            const priceConfidence = bank
                .getPrice(priceInfo, price_1.PriceBias.None, false)
                .minus(bank.getPrice(priceInfo, price_1.PriceBias.Lowest, false));
            liquidationPrice = liabilities.minus(assets).div(amountBn.times(assetWeight)).plus(priceConfidence);
        }
        else {
            const liabWeight = bank.getLiabilityWeight(MarginRequirementType.Maintenance);
            const priceConfidence = bank
                .getPrice(priceInfo, price_1.PriceBias.Highest, false)
                .minus(bank.getPrice(priceInfo, price_1.PriceBias.None, false));
            liquidationPrice = assets.minus(liabilities).div(amountBn.times(liabWeight)).minus(priceConfidence);
        }
        if (liquidationPrice.isNaN() || liquidationPrice.lt(0))
            return null;
        return liquidationPrice.toNumber();
    }
    // Calculate the max amount of collateral to liquidate to bring an account maint health to 0 (assuming negative health).
    //
    // The asset amount is bounded by 2 constraints,
    // (1) the amount of liquidated collateral cannot be more than the balance,
    // (2) the amount of covered liablity cannot be more than existing liablity.
    computeMaxLiquidatableAssetAmount(banks, oraclePrices, assetBankAddress, liabilityBankAddress) {
        const debug = require("debug")("mfi:getMaxLiquidatableAssetAmount");
        const assetBank = banks.get(assetBankAddress.toBase58());
        if (!assetBank)
            throw Error(`Bank ${assetBankAddress.toBase58()} not found`);
        const assetPriceInfo = oraclePrices.get(assetBankAddress.toBase58());
        if (!assetPriceInfo)
            throw Error(`Price info for ${assetBankAddress.toBase58()} not found`);
        const liabilityBank = banks.get(liabilityBankAddress.toBase58());
        if (!liabilityBank)
            throw Error(`Bank ${liabilityBankAddress.toBase58()} not found`);
        const liabilityPriceInfo = oraclePrices.get(liabilityBankAddress.toBase58());
        if (!liabilityPriceInfo)
            throw Error(`Price info for ${liabilityBankAddress.toBase58()} not found`);
        const { assets, liabilities } = this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Maintenance);
        const currentHealth = assets.minus(liabilities);
        const priceAssetLower = assetBank.getPrice(assetPriceInfo, price_1.PriceBias.Lowest, false);
        const priceAssetMarket = assetBank.getPrice(assetPriceInfo, price_1.PriceBias.None, false);
        const assetMaintWeight = assetBank.config.assetWeightMaint;
        const liquidationDiscount = new bignumber_js_1.default(0.95);
        const priceLiabHighest = liabilityBank.getPrice(liabilityPriceInfo, price_1.PriceBias.Highest, false);
        const priceLiabMarket = liabilityBank.getPrice(liabilityPriceInfo, price_1.PriceBias.None, false);
        const liabMaintWeight = liabilityBank.config.liabilityWeightMaint;
        debug("h: %d, w_a: %d, w_l: %d, d: %d", currentHealth.toFixed(6), assetMaintWeight, liabMaintWeight, liquidationDiscount);
        const underwaterMaintUsdValue = currentHealth.div(assetMaintWeight.minus(liabMaintWeight.times(liquidationDiscount)));
        debug("Underwater maint usd to adjust: $%d", underwaterMaintUsdValue.toFixed(6));
        // MAX asset amount bounded by available asset amount
        const assetBalance = this.getBalance(assetBankAddress);
        const assetsAmountUi = assetBalance.computeQuantityUi(assetBank).assets;
        const assetsUsdValue = assetsAmountUi.times(priceAssetLower);
        // MAX asset amount bounded by available liability amount
        const liabilityBalance = this.getBalance(liabilityBankAddress);
        const liabilitiesAmountUi = liabilityBalance.computeQuantityUi(liabilityBank).liabilities;
        const liabUsdValue = liabilitiesAmountUi.times(liquidationDiscount).times(priceLiabHighest);
        debug("Collateral amount: %d, price: %d, value: %d", assetsAmountUi.toFixed(6), priceAssetMarket.toFixed(6), assetsUsdValue.times(priceAssetMarket).toFixed(6));
        debug("Liab amount: %d, price: %d, value: %d", liabilitiesAmountUi.toFixed(6), priceLiabMarket.toFixed(6), liabUsdValue.toFixed(6));
        const maxLiquidatableUsdValue = bignumber_js_1.default.min(assetsUsdValue, underwaterMaintUsdValue, liabUsdValue);
        debug("Max liquidatable usd value: %d", maxLiquidatableUsdValue.toFixed(6));
        return maxLiquidatableUsdValue.div(priceAssetLower);
    }
    getHealthCheckAccounts(banks, mandatoryBanks = [], excludedBanks = []) {
        const mandatoryBanksSet = new Set(mandatoryBanks.map((b) => b.address.toBase58()));
        const excludedBanksSet = new Set(excludedBanks.map((b) => b.address.toBase58()));
        const activeBanks = new Set(this.activeBalances.map((b) => b.bankPk.toBase58()));
        const banksToAdd = new Set([...mandatoryBanksSet].filter((x) => !activeBanks.has(x)));
        let slotsToKeep = banksToAdd.size;
        return this.balances
            .filter((balance) => {
            if (balance.active) {
                return !excludedBanksSet.has(balance.bankPk.toBase58());
            }
            else if (slotsToKeep > 0) {
                slotsToKeep--;
                return true;
            }
            else {
                return false;
            }
        })
            .map((balance) => {
            if (balance.active) {
                return balance.bankPk.toBase58();
            }
            const newBank = [...banksToAdd.values()][0];
            banksToAdd.delete(newBank);
            return newBank;
        })
            .flatMap((bankPk) => {
            const bank = banks.get(bankPk);
            if (!bank)
                throw Error(`Could not find bank ${bankPk}`);
            return [
                {
                    pubkey: new web3_js_1.PublicKey(bankPk),
                    isSigner: false,
                    isWritable: false,
                },
                {
                    pubkey: bank.config.oracleKeys[0],
                    isSigner: false,
                    isWritable: false,
                },
            ];
        });
    }
    // ----------------------------------------------------------------------------
    // Actions
    // ----------------------------------------------------------------------------
    async makeDepositIx(program, banks, amount, bankAddress) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        const userTokenAtaPk = (0, mrgn_common_1.getAssociatedTokenAddressSync)(bank.mint, this.authority, true); // We allow off curve addresses here to support Fuse.
        const remainingAccounts = this.getHealthCheckAccounts(banks, [bank]);
        const ix = await instructions_1.default.makeDepositIx(program, {
            marginfiGroupPk: this.group,
            marginfiAccountPk: this.address,
            authorityPk: this.authority,
            signerTokenAccountPk: userTokenAtaPk,
            bankPk: bank.address,
        }, { amount: (0, mrgn_common_1.uiToNative)(amount, bank.mintDecimals) }, remainingAccounts);
        const depositIxs = bank.mint.equals(mrgn_common_1.NATIVE_MINT) ? this.wrapInstructionForWSol(ix, amount) : [ix];
        return {
            instructions: depositIxs,
            keys: [],
        };
    }
    async makeRepayIx(program, banks, amount, bankAddress, repayAll = false) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        let ixs = [];
        // Add additional CU request if necessary
        const activeBalances = this.balances.filter((b) => b.active);
        if (activeBalances.length >= 4) {
            ixs.push(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 600000 }));
        }
        // Add emissions-related instructions if necessary
        if (repayAll && !bank.emissionsMint.equals(web3_js_1.PublicKey.default)) {
            const userAta = (0, mrgn_common_1.getAssociatedTokenAddressSync)(bank.emissionsMint, this.authority, true); // We allow off curve addresses here to support Fuse.
            const createAtaIdempotentIx = (0, mrgn_common_1.createAssociatedTokenAccountIdempotentInstruction)(this.authority, userAta, this.authority, bank.emissionsMint);
            ixs.push(createAtaIdempotentIx);
            ixs.push(...(await this.makeWithdrawEmissionsIx(program, banks, bankAddress)).instructions);
        }
        // Add repay-related instructions
        const userAta = (0, mrgn_common_1.getAssociatedTokenAddressSync)(bank.mint, this.authority, true); // We allow off curve addresses here to support Fuse.
        const remainingAccounts = repayAll
            ? this.getHealthCheckAccounts(banks, [], [bank])
            : this.getHealthCheckAccounts(banks, [bank], []);
        const ix = await instructions_1.default.makeRepayIx(program, {
            marginfiGroupPk: this.group,
            marginfiAccountPk: this.address,
            authorityPk: this.authority,
            signerTokenAccountPk: userAta,
            bankPk: bankAddress,
        }, { amount: (0, mrgn_common_1.uiToNative)(amount, bank.mintDecimals), repayAll }, remainingAccounts);
        const repayIxs = bank.mint.equals(mrgn_common_1.NATIVE_MINT) ? this.wrapInstructionForWSol(ix, amount) : [ix];
        ixs.push(...repayIxs);
        return {
            instructions: ixs,
            keys: [],
        };
    }
    async makeWithdrawIx(program, banks, amount, bankAddress, withdrawAll = false) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        let ixs = [];
        // Add additional CU request if necessary
        const activeBalances = this.balances.filter((b) => b.active);
        if (activeBalances.length >= 4) {
            ixs.push(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 }));
        }
        // Add emissions-related instructions if necessary
        if (withdrawAll && !bank.emissionsMint.equals(web3_js_1.PublicKey.default)) {
            const userAta = (0, mrgn_common_1.getAssociatedTokenAddressSync)(bank.emissionsMint, this.authority, true); // We allow off curve addresses here to support Fuse.
            const createAtaIdempotentIx = (0, mrgn_common_1.createAssociatedTokenAccountIdempotentInstruction)(this.authority, userAta, this.authority, bank.emissionsMint);
            ixs.push(createAtaIdempotentIx);
            ixs.push(...(await this.makeWithdrawEmissionsIx(program, banks, bankAddress)).instructions);
        }
        const userAta = (0, mrgn_common_1.getAssociatedTokenAddressSync)(bank.mint, this.authority, true);
        const createAtaIdempotentIx = (0, mrgn_common_1.createAssociatedTokenAccountIdempotentInstruction)(this.authority, userAta, this.authority, bank.mint);
        ixs.push(createAtaIdempotentIx);
        // Add withdraw-related instructions
        const remainingAccounts = withdrawAll
            ? this.getHealthCheckAccounts(banks, [], [bank])
            : this.getHealthCheckAccounts(banks, [bank], []);
        const ix = await instructions_1.default.makeWithdrawIx(program, {
            marginfiGroupPk: this.group,
            marginfiAccountPk: this.address,
            signerPk: this.authority,
            bankPk: bank.address,
            destinationTokenAccountPk: userAta,
        }, { amount: (0, mrgn_common_1.uiToNative)(amount, bank.mintDecimals), withdrawAll }, remainingAccounts);
        const withdrawIxs = bank.mint.equals(mrgn_common_1.NATIVE_MINT) ? this.wrapInstructionForWSol(ix) : [ix];
        ixs.push(...withdrawIxs);
        return {
            instructions: ixs,
            keys: [],
        };
    }
    async makeBorrowIx(program, banks, amount, bankAddress, opt) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        let ixs = [];
        const userAta = (0, mrgn_common_1.getAssociatedTokenAddressSync)(bank.mint, this.authority, true); // We allow off curve addresses here to support Fuse.
        // Add additional CU request if necessary
        const activeBalances = this.balances.filter((b) => b.active);
        if (activeBalances.length >= 4) {
            ixs.push(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 1000000 }));
        }
        // Add borrow-related instructions
        const createAtaIdempotentIx = (0, mrgn_common_1.createAssociatedTokenAccountIdempotentInstruction)(this.authority, userAta, this.authority, bank.mint);
        ixs.push(createAtaIdempotentIx);
        const remainingAccounts = this.getHealthCheckAccounts(banks, (opt?.remainingAccountsBankOverride?.length ?? 0) > 0 ? opt?.remainingAccountsBankOverride : [bank]);
        const ix = await instructions_1.default.makeBorrowIx(program, {
            marginfiGroupPk: this.group,
            marginfiAccountPk: this.address,
            signerPk: this.authority,
            bankPk: bank.address,
            destinationTokenAccountPk: userAta,
        }, { amount: (0, mrgn_common_1.uiToNative)(amount, bank.mintDecimals) }, remainingAccounts);
        const borrowIxs = bank.mint.equals(mrgn_common_1.NATIVE_MINT) ? this.wrapInstructionForWSol(ix) : [ix];
        ixs.push(...borrowIxs);
        return {
            instructions: ixs,
            keys: [],
        };
    }
    async makeWithdrawEmissionsIx(program, banks, bankAddress) {
        const bank = banks.get(bankAddress.toBase58());
        if (!bank)
            throw Error(`Bank ${bankAddress.toBase58()} not found`);
        let ixs = [];
        const userAta = (0, mrgn_common_1.getAssociatedTokenAddressSync)(bank.emissionsMint, this.authority, true); // We allow off curve addresses here to support Fuse.
        const createAtaIdempotentIx = (0, mrgn_common_1.createAssociatedTokenAccountIdempotentInstruction)(this.authority, userAta, this.authority, bank.emissionsMint);
        ixs.push(createAtaIdempotentIx);
        const withdrawEmissionsIx = await instructions_1.default.makelendingAccountWithdrawEmissionIx(program, {
            marginfiGroup: this.group,
            marginfiAccount: this.address,
            signer: this.authority,
            bank: bank.address,
            destinationTokenAccount: userAta,
            emissionsMint: bank.emissionsMint,
        });
        ixs.push(withdrawEmissionsIx);
        return { instructions: ixs, keys: [] };
    }
    async makeLendingAccountLiquidateIx(liquidateeMarginfiAccount, program, banks, assetBankAddress, assetQuantityUi, liabilityBankAddress) {
        const assetBank = banks.get(assetBankAddress.toBase58());
        if (!assetBank)
            throw Error(`Asset bank ${assetBankAddress.toBase58()} not found`);
        const liabilityBank = banks.get(liabilityBankAddress.toBase58());
        if (!liabilityBank)
            throw Error(`Liability bank ${liabilityBankAddress.toBase58()} not found`);
        let ixs = [];
        ixs.push(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 1400000 }));
        const liquidateIx = await instructions_1.default.makeLendingAccountLiquidateIx(program, {
            marginfiGroup: this.group,
            signer: this.authority,
            assetBank: assetBankAddress,
            liabBank: liabilityBankAddress,
            liquidatorMarginfiAccount: this.address,
            liquidateeMarginfiAccount: liquidateeMarginfiAccount.address,
        }, { assetAmount: (0, mrgn_common_1.uiToNative)(assetQuantityUi, assetBank.mintDecimals) }, [
            {
                pubkey: assetBank.config.oracleKeys[0],
                isSigner: false,
                isWritable: false,
            },
            {
                pubkey: liabilityBank.config.oracleKeys[0],
                isSigner: false,
                isWritable: false,
            },
            ...this.getHealthCheckAccounts(banks, [liabilityBank, assetBank]),
            ...liquidateeMarginfiAccount.getHealthCheckAccounts(banks),
        ]);
        ixs.push(liquidateIx);
        return { instructions: ixs, keys: [] };
    }
    async makeBeginFlashLoanIx(program, endIndex) {
        const ix = await instructions_1.default.makeBeginFlashLoanIx(program, {
            marginfiAccount: this.address,
            signer: this.authority,
        }, { endIndex: new bn_js_1.default(endIndex) });
        return { instructions: [ix], keys: [] };
    }
    async makeEndFlashLoanIx(program, banks) {
        const remainingAccounts = this.getHealthCheckAccounts(banks);
        const ix = await instructions_1.default.makeEndFlashLoanIx(program, {
            marginfiAccount: this.address,
            signer: this.authority,
        }, remainingAccounts);
        return { instructions: [ix], keys: [] };
    }
    wrapInstructionForWSol(ix, amount = new bignumber_js_1.default(0)) {
        return [...(0, utils_1.makeWrapSolIxs)(this.authority, new bignumber_js_1.default(amount)), ix, (0, utils_1.makeUnwrapSolIx)(this.authority)];
    }
    describe(banks, oraclePrices) {
        const { assets, liabilities } = this.computeHealthComponents(banks, oraclePrices, MarginRequirementType.Equity);
        let description = `
- Marginfi account: ${this.address}
- Authority: ${this.authority}
- Total deposits: $${assets.toFixed(6)}
- Total liabilities: $${liabilities.toFixed(6)}
- Equity: $${assets.minus(liabilities).toFixed(6)}
- Health: ${assets.minus(liabilities).div(assets).times(100).toFixed(2)}%
- Balances:\n`;
        for (const balance of this.activeBalances) {
            const bank = banks.get(balance.bankPk.toBase58());
            const priceInfo = oraclePrices.get(balance.bankPk.toBase58());
            description += balance.describe(bank, priceInfo);
        }
        return description;
    }
}
exports.MarginfiAccount = MarginfiAccount;
var MarginRequirementType;
(function (MarginRequirementType) {
    MarginRequirementType[MarginRequirementType["Initial"] = 0] = "Initial";
    MarginRequirementType[MarginRequirementType["Maintenance"] = 1] = "Maintenance";
    MarginRequirementType[MarginRequirementType["Equity"] = 2] = "Equity";
})(MarginRequirementType || (MarginRequirementType = {}));
exports.MarginRequirementType = MarginRequirementType;
function isWeightedPrice(reqType) {
    return reqType === MarginRequirementType.Initial;
}
exports.isWeightedPrice = isWeightedPrice;
