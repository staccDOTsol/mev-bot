"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balance = void 0;
const mrgn_common_1 = require("@mrgnlabs/mrgn-common");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const __1 = require("..");
// ----------------------------------------------------------------------------
// Client types
// ----------------------------------------------------------------------------
class Balance {
    constructor(active, bankPk, assetShares, liabilityShares, emissionsOutstanding, lastUpdate) {
        this.active = active;
        this.bankPk = bankPk;
        this.assetShares = assetShares;
        this.liabilityShares = liabilityShares;
        this.emissionsOutstanding = emissionsOutstanding;
        this.lastUpdate = lastUpdate;
    }
    static from(balanceRaw) {
        const active = balanceRaw.active;
        const bankPk = balanceRaw.bankPk;
        const assetShares = (0, mrgn_common_1.wrappedI80F48toBigNumber)(balanceRaw.assetShares);
        const liabilityShares = (0, mrgn_common_1.wrappedI80F48toBigNumber)(balanceRaw.liabilityShares);
        const emissionsOutstanding = (0, mrgn_common_1.wrappedI80F48toBigNumber)(balanceRaw.emissionsOutstanding);
        const lastUpdate = balanceRaw.lastUpdate.toNumber();
        return new Balance(active, bankPk, assetShares, liabilityShares, emissionsOutstanding, lastUpdate);
    }
    static createEmpty(bankPk) {
        return new Balance(false, bankPk, new bignumber_js_1.default(0), new bignumber_js_1.default(0), new bignumber_js_1.default(0), 0);
    }
    computeUsdValue(bank, oraclePrice, marginRequirementType = __1.MarginRequirementType.Equity) {
        const assetsValue = bank.computeAssetUsdValue(oraclePrice, this.assetShares, marginRequirementType, __1.PriceBias.None);
        const liabilitiesValue = bank.computeLiabilityUsdValue(oraclePrice, this.liabilityShares, marginRequirementType, __1.PriceBias.None);
        return { assets: assetsValue, liabilities: liabilitiesValue };
    }
    getUsdValueWithPriceBias(bank, oraclePrice, marginRequirementType = __1.MarginRequirementType.Equity) {
        const assetsValue = bank.computeAssetUsdValue(oraclePrice, this.assetShares, marginRequirementType, __1.PriceBias.Lowest);
        const liabilitiesValue = bank.computeLiabilityUsdValue(oraclePrice, this.liabilityShares, marginRequirementType, __1.PriceBias.Highest);
        return { assets: assetsValue, liabilities: liabilitiesValue };
    }
    computeQuantity(bank) {
        const assetsQuantity = bank.getAssetQuantity(this.assetShares);
        const liabilitiesQuantity = bank.getLiabilityQuantity(this.liabilityShares);
        return { assets: assetsQuantity, liabilities: liabilitiesQuantity };
    }
    computeQuantityUi(bank) {
        const assetsQuantity = new bignumber_js_1.default((0, mrgn_common_1.nativeToUi)(bank.getAssetQuantity(this.assetShares), bank.mintDecimals));
        const liabilitiesQuantity = new bignumber_js_1.default((0, mrgn_common_1.nativeToUi)(bank.getLiabilityQuantity(this.liabilityShares), bank.mintDecimals));
        return { assets: assetsQuantity, liabilities: liabilitiesQuantity };
    }
    computeTotalOutstandingEmissions(bank) {
        const claimedEmissions = this.emissionsOutstanding;
        const unclaimedEmissions = this.computeClaimedEmissions(bank, Date.now() / 1000);
        return claimedEmissions.plus(unclaimedEmissions);
    }
    computeClaimedEmissions(bank, currentTimestamp) {
        const lendingActive = bank.emissionsActiveLending;
        const borrowActive = bank.emissionsActiveBorrowing;
        const { assets, liabilities } = this.computeQuantity(bank);
        let balanceAmount = null;
        if (lendingActive) {
            balanceAmount = assets;
        }
        else if (borrowActive) {
            balanceAmount = liabilities;
        }
        if (balanceAmount) {
            const lastUpdate = this.lastUpdate;
            const period = new bignumber_js_1.default(currentTimestamp - lastUpdate);
            const emissionsRate = new bignumber_js_1.default(bank.emissionsRate);
            const emissions = period
                .times(balanceAmount)
                .times(emissionsRate)
                .div(31536000 * Math.pow(10, bank.mintDecimals));
            const emissionsReal = bignumber_js_1.default.min(emissions, new bignumber_js_1.default(bank.emissionsRemaining));
            return emissionsReal;
        }
        return new bignumber_js_1.default(0);
    }
    describe(bank, oraclePrice) {
        let { assets: assetsQt, liabilities: liabsQt } = this.computeQuantityUi(bank);
        let { assets: assetsUsd, liabilities: liabsUsd } = this.computeUsdValue(bank, oraclePrice, __1.MarginRequirementType.Equity);
        return `> ${bank.tokenSymbol ?? bank.address} balance:
\t- Deposits: ${assetsQt.toFixed(5)} (${assetsUsd.toFixed(5)} USD)
\t- Borrows: ${liabsQt.toFixed(5)} (${liabsUsd.toFixed(5)} USD)
`;
    }
}
exports.Balance = Balance;
