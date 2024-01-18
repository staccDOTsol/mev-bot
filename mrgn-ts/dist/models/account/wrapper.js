"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarginfiAccountWrapper = void 0;
const mrgn_common_1 = require("@mrgnlabs/mrgn-common");
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const __1 = require("../..");
const idl_1 = require("../../idl");
const types_1 = require("../../types");
const pure_1 = require("./pure");
const bank_1 = require("../bank");
class MarginfiAccountWrapper {
    // --------------------------------------------------------------------------
    // Factories
    // --------------------------------------------------------------------------
    /**
     * @internal
     */
    constructor(marginfiAccountPk, client, marginfiAccount) {
        this.client = client;
        this.address = marginfiAccountPk;
        this._marginfiAccount = marginfiAccount;
    }
    static async fetch(marginfiAccountPk, client, commitment) {
        const { config, program } = client;
        const _marginfiAccountPk = (0, anchor_1.translateAddress)(marginfiAccountPk);
        const accountData = await MarginfiAccountWrapper._fetchAccountData(_marginfiAccountPk, config, program, commitment);
        const marginfiAccount = new pure_1.MarginfiAccount(_marginfiAccountPk, accountData);
        const marginfiAccountProxy = new MarginfiAccountWrapper(_marginfiAccountPk, client, marginfiAccount);
        require("debug")("mfi:margin-account")("Loaded marginfi account %s", _marginfiAccountPk);
        return marginfiAccountProxy;
    }
    static fromAccountParsed(marginfiAccountPk, client, accountData) {
        if (!accountData.group.equals(client.config.groupPk))
            throw Error(`Marginfi account tied to group ${accountData.group.toBase58()}. Expected: ${client.config.groupPk.toBase58()}`);
        const _marginfiAccountPk = (0, anchor_1.translateAddress)(marginfiAccountPk);
        const marginfiAccount = new pure_1.MarginfiAccount(_marginfiAccountPk, accountData);
        return new MarginfiAccountWrapper(_marginfiAccountPk, client, marginfiAccount);
    }
    static fromAccountDataRaw(marginfiAccountPk, client, marginfiAccountRawData) {
        const marginfiAccountData = pure_1.MarginfiAccount.decode(marginfiAccountRawData);
        return MarginfiAccountWrapper.fromAccountParsed(marginfiAccountPk, client, marginfiAccountData);
    }
    // --------------------------------------------------------------------------
    // Attributes
    // --------------------------------------------------------------------------
    get authority() {
        return this._marginfiAccount.authority;
    }
    get group() {
        return this.client.group;
    }
    get balances() {
        return this._marginfiAccount.balances;
    }
    get data() {
        return this._marginfiAccount;
    }
    /** @internal */
    get _program() {
        return this.client.program;
    }
    /** @internal */
    get _config() {
        return this.client.config;
    }
    get activeBalances() {
        return this._marginfiAccount.balances.filter((la) => la.active);
    }
    get isDisabled() {
        return this._marginfiAccount.isDisabled;
    }
    get isFlashLoanEnabled() {
        return this._marginfiAccount.isFlashLoanEnabled;
    }
    getBalance(bankPk) {
        return this._marginfiAccount.getBalance(bankPk);
    }
    canBeLiquidated() {
        const { assets, liabilities } = this._marginfiAccount.computeHealthComponents(this.client.banks, this.client.oraclePrices, pure_1.MarginRequirementType.Maintenance);
        return assets.lt(liabilities);
    }
    computeHealthComponents(marginRequirement, excludedBanks = []) {
        return this._marginfiAccount.computeHealthComponents(this.client.banks, this.client.oraclePrices, marginRequirement, excludedBanks);
    }
    computeFreeCollateral(opts) {
        return this._marginfiAccount.computeFreeCollateral(this.client.banks, this.client.oraclePrices, opts);
    }
    computeHealthComponentsWithoutBias(marginRequirement) {
        return this._marginfiAccount.computeHealthComponentsWithoutBias(this.client.banks, this.client.oraclePrices, marginRequirement);
    }
    computeAccountValue() {
        return this._marginfiAccount.computeAccountValue(this.client.banks, this.client.oraclePrices);
    }
    computeMaxBorrowForBank(bankAddress, opts) {
        return this._marginfiAccount.computeMaxBorrowForBank(this.client.banks, this.client.oraclePrices, bankAddress, opts);
    }
    computeMaxWithdrawForBank(bankAddress, opts) {
        return this._marginfiAccount.computeMaxWithdrawForBank(this.client.banks, this.client.oraclePrices, bankAddress, opts);
    }
    computeMaxLiquidatableAssetAmount(assetBankAddress, liabilityBankAddress) {
        return this._marginfiAccount.computeMaxLiquidatableAssetAmount(this.client.banks, this.client.oraclePrices, assetBankAddress, liabilityBankAddress);
    }
    computeLiquidationPriceForBank(bankAddress) {
        return this._marginfiAccount.computeLiquidationPriceForBank(this.client.banks, this.client.oraclePrices, bankAddress);
    }
    computeLiquidationPriceForBankAmount(bankAddress, isLending, amount) {
        return this._marginfiAccount.computeLiquidationPriceForBankAmount(this.client.banks, this.client.oraclePrices, bankAddress, isLending, amount);
    }
    computeNetApy() {
        return this._marginfiAccount.computeNetApy(this.client.banks, this.client.oraclePrices);
    }
    makePriorityFeeIx(priorityFeeUi) {
        const priorityFeeIx = [];
        const limitCU = 1400000;
        let microLamports = 1;
        if (priorityFeeUi) {
            const priorityFeeMicroLamports = priorityFeeUi * web3_js_1.LAMPORTS_PER_SOL * 1000000;
            microLamports = Math.round(priorityFeeMicroLamports / limitCU);
        }
        priorityFeeIx.push(web3_js_1.ComputeBudgetProgram.setComputeUnitPrice({
            microLamports,
        }));
        return priorityFeeIx;
    }
    // --------------------------------------------------------------------------
    // User actions
    // --------------------------------------------------------------------------
    async makeDepositIx(amount, bankAddress) {
        return this._marginfiAccount.makeDepositIx(this._program, this.client.banks, amount, bankAddress);
    }
    async deposit(amount, bankAddress, priorityFeeUi) {
        const debug = require("debug")(`mfi:margin-account:${this.address.toString()}:deposit`);
        debug("Depositing %s into marginfi account (bank: %s)", amount, (0, mrgn_common_1.shortenAddress)(bankAddress));
        const priorityFeeIx = this.makePriorityFeeIx(priorityFeeUi);
        const ixs = await this.makeDepositIx(amount, bankAddress);
        const tx = new web3_js_1.Transaction().add(...priorityFeeIx, ...ixs.instructions);
        const sig = await this.client.processTransaction(tx, []);
        debug("Depositing successful %s", sig);
        return sig;
    }
    async simulateDeposit(amount, bankAddress) {
        const ixs = await this.makeDepositIx(amount, bankAddress);
        const tx = new web3_js_1.Transaction().add(...ixs.instructions);
        const [mfiAccountData, bankData] = await this.client.simulateTransaction(tx, [this.address, bankAddress]);
        if (!mfiAccountData || !bankData)
            throw new Error("Failed to simulate deposit");
        const previewBanks = this.client.banks;
        previewBanks.set(bankAddress.toBase58(), bank_1.Bank.fromBuffer(bankAddress, bankData));
        const previewClient = new __1.MarginfiClient(this._config, this.client.program, {}, true, this.client.group, this.client.banks, this.client.oraclePrices);
        const previewMarginfiAccount = MarginfiAccountWrapper.fromAccountDataRaw(this.address, previewClient, mfiAccountData);
        return {
            banks: previewBanks,
            marginfiAccount: previewMarginfiAccount,
        };
    }
    async makeRepayIx(amount, bankAddress, repayAll = false) {
        return this._marginfiAccount.makeRepayIx(this._program, this.client.banks, amount, bankAddress, repayAll);
    }
    async repay(amount, bankAddress, repayAll = false, priorityFeeUi) {
        const debug = require("debug")(`mfi:margin-account:${this.address.toString()}:repay`);
        debug("Repaying %s into marginfi account (bank: %s), repay all: %s", amount, bankAddress, repayAll);
        const priorityFeeIx = this.makePriorityFeeIx(priorityFeeUi);
        const ixs = await this.makeRepayIx(amount, bankAddress, repayAll);
        const tx = new web3_js_1.Transaction().add(...priorityFeeIx, ...ixs.instructions);
        const sig = await this.client.processTransaction(tx, []);
        debug("Depositing successful %s", sig);
        return sig;
    }
    async simulateRepay(amount, bankAddress, repayAll = false) {
        const ixs = await this.makeRepayIx(amount, bankAddress, repayAll);
        const tx = new web3_js_1.Transaction().add(...ixs.instructions);
        const [mfiAccountData, bankData] = await this.client.simulateTransaction(tx, [this.address, bankAddress]);
        if (!mfiAccountData || !bankData)
            throw new Error("Failed to simulate repay");
        const previewBanks = this.client.banks;
        previewBanks.set(bankAddress.toBase58(), bank_1.Bank.fromBuffer(bankAddress, bankData));
        const previewClient = new __1.MarginfiClient(this._config, this.client.program, {}, true, this.client.group, this.client.banks, this.client.oraclePrices);
        const previewMarginfiAccount = MarginfiAccountWrapper.fromAccountDataRaw(this.address, previewClient, mfiAccountData);
        return {
            banks: previewBanks,
            marginfiAccount: previewMarginfiAccount,
        };
    }
    async makeWithdrawIx(amount, bankAddress, withdrawAll = false) {
        return this._marginfiAccount.makeWithdrawIx(this._program, this.client.banks, amount, bankAddress, withdrawAll);
    }
    async withdraw(amount, bankAddress, withdrawAll = false, priorityFeeUi) {
        const debug = require("debug")(`mfi:margin-account:${this.address.toString()}:withdraw`);
        debug("Withdrawing %s from marginfi account", amount);
        const priorityFeeIx = this.makePriorityFeeIx(priorityFeeUi);
        const ixs = await this.makeWithdrawIx(amount, bankAddress, withdrawAll);
        const tx = new web3_js_1.Transaction().add(...priorityFeeIx, ...ixs.instructions);
        const sig = await this.client.processTransaction(tx, []);
        debug("Withdrawing successful %s", sig);
        return sig;
    }
    async simulateWithdraw(amount, bankAddress, withdrawAll = false) {
        const ixs = await this.makeWithdrawIx(amount, bankAddress, withdrawAll);
        const tx = new web3_js_1.Transaction().add(...ixs.instructions);
        const [mfiAccountData, bankData] = await this.client.simulateTransaction(tx, [this.address, bankAddress]);
        if (!mfiAccountData || !bankData)
            throw new Error("Failed to simulate withdraw");
        const previewBanks = this.client.banks;
        previewBanks.set(bankAddress.toBase58(), bank_1.Bank.fromBuffer(bankAddress, bankData));
        const previewClient = new __1.MarginfiClient(this._config, this.client.program, {}, true, this.client.group, this.client.banks, this.client.oraclePrices);
        const previewMarginfiAccount = MarginfiAccountWrapper.fromAccountDataRaw(this.address, previewClient, mfiAccountData);
        return {
            banks: previewBanks,
            marginfiAccount: previewMarginfiAccount,
        };
    }
    async makeBorrowIx(amount, bankAddress, opt) {
        return this._marginfiAccount.makeBorrowIx(this._program, this.client.banks, amount, bankAddress, opt);
    }
    async borrow(amount, bankAddress, priorityFeeUi) {
        const debug = require("debug")(`mfi:margin-account:${this.address.toString()}:borrow`);
        debug("Borrowing %s from marginfi account", amount);
        const priorityFeeIx = this.makePriorityFeeIx(priorityFeeUi);
        const ixs = await this.makeBorrowIx(amount, bankAddress);
        const tx = new web3_js_1.Transaction().add(...priorityFeeIx, ...ixs.instructions);
        const sig = await this.client.processTransaction(tx, []);
        debug("Borrowing successful %s", sig);
        return sig;
    }
    async simulateBorrow(amount, bankAddress) {
        const ixs = await this.makeBorrowIx(amount, bankAddress);
        const tx = new web3_js_1.Transaction().add(...ixs.instructions);
        const [mfiAccountData, bankData] = await this.client.simulateTransaction(tx, [this.address, bankAddress]);
        if (!mfiAccountData || !bankData)
            throw new Error("Failed to simulate borrow");
        const previewBanks = this.client.banks;
        previewBanks.set(bankAddress.toBase58(), bank_1.Bank.fromBuffer(bankAddress, bankData));
        const previewClient = new __1.MarginfiClient(this._config, this.client.program, {}, true, this.client.group, this.client.banks, this.client.oraclePrices);
        const previewMarginfiAccount = MarginfiAccountWrapper.fromAccountDataRaw(this.address, previewClient, mfiAccountData);
        return {
            banks: previewBanks,
            marginfiAccount: previewMarginfiAccount,
        };
    }
    async makeWithdrawEmissionsIx(bankAddress) {
        return this._marginfiAccount.makeWithdrawEmissionsIx(this._program, this.client.banks, bankAddress);
    }
    async withdrawEmissions(bankAddress) {
        const debug = require("debug")(`mfi:margin-account:${this.address.toString()}:withdraw-emissions`);
        debug("Withdrawing emission from marginfi account (bank: %s)", bankAddress);
        const ixs = await this.makeWithdrawEmissionsIx(bankAddress);
        const tx = new web3_js_1.Transaction().add(...ixs.instructions);
        const sig = await this.client.processTransaction(tx, []);
        debug("Withdrawing emission successful %s", sig);
        return sig;
    }
    async makeLendingAccountLiquidateIx(liquidateeMarginfiAccount, assetBankAddress, assetQuantityUi, liabBankAddress) {
        return this._marginfiAccount.makeLendingAccountLiquidateIx(liquidateeMarginfiAccount, this._program, this.client.banks, assetBankAddress, assetQuantityUi, liabBankAddress);
    }
    async lendingAccountLiquidate(liquidateeMarginfiAccount, assetBankAddress, assetQuantityUi, liabBankAddress) {
        const debug = require("debug")(`mfi:margin-account:${this.address.toString()}:liquidation`);
        debug("Liquidating marginfi account %s", liquidateeMarginfiAccount.address.toBase58());
        const ixw = await this.makeLendingAccountLiquidateIx(liquidateeMarginfiAccount, assetBankAddress, assetQuantityUi, liabBankAddress);
        const tx = new web3_js_1.Transaction().add(...ixw.instructions);
        const sig = await this.client.processTransaction(tx, []);
        debug("Liquidation successful %s", sig);
        return sig;
    }
    async makeBeginFlashLoanIx(endIndex) {
        return this._marginfiAccount.makeBeginFlashLoanIx(this._program, endIndex);
    }
    async makeEndFlashLoanIx() {
        return this._marginfiAccount.makeEndFlashLoanIx(this._program, this.client.banks);
    }
    async flashLoan(args) {
        const debug = require("debug")(`mfi:margin-account:${this.address.toString()}:flash-loan`);
        debug("Performing flash loan");
        const endIndex = args.ixs.length + 1;
        const beginFlashLoanIx = await this.makeBeginFlashLoanIx(endIndex);
        const endFlashLoanIx = await this.makeEndFlashLoanIx();
        const ixs = [
            ...beginFlashLoanIx.instructions,
            ...args.ixs,
            ...endFlashLoanIx.instructions,
        ];
        const tx = new web3_js_1.Transaction().add(...ixs);
        const sig = await this.client.processTransaction(tx, args.signers);
        debug("Flash loan successful %s", sig);
        return sig;
    }
    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    getHealthCheckAccounts(mandatoryBanks = [], excludedBanks = []) {
        return this._marginfiAccount.getHealthCheckAccounts(this.client.banks, mandatoryBanks, excludedBanks);
    }
    static async _fetchAccountData(accountAddress, config, program, commitment) {
        const mergedCommitment = commitment ?? program.provider.connection.commitment ?? mrgn_common_1.DEFAULT_COMMITMENT;
        const data = (await program.account.marginfiAccount.fetch(accountAddress, mergedCommitment));
        if (!data.group.equals(config.groupPk))
            throw Error(`Marginfi account tied to group ${data.group.toBase58()}. Expected: ${config.groupPk.toBase58()}`);
        return data;
    }
    static async encode(decoded) {
        const coder = new anchor_1.BorshCoder(idl_1.MARGINFI_IDL);
        return await coder.accounts.encode(types_1.AccountType.MarginfiAccount, decoded);
    }
    async reload() {
        require("debug")(`mfi:margin-account:${this.address.toBase58().toString()}:loader`)("Reloading account data");
        const marginfiAccountAi = await this._program.account.marginfiAccount.getAccountInfo(this.address);
        if (!marginfiAccountAi)
            throw new Error(`Failed to fetch data for marginfi account ${this.address.toBase58()}`);
        const marginfiAccountParsed = pure_1.MarginfiAccount.decode(marginfiAccountAi.data);
        if (!marginfiAccountParsed.group.equals(this._config.groupPk))
            throw Error(`Marginfi account tied to group ${marginfiAccountParsed.group.toBase58()}. Expected: ${this._config.groupPk.toBase58()}`);
        this._updateFromAccountParsed(marginfiAccountParsed);
    }
    _updateFromAccountParsed(data) {
        this._marginfiAccount = new pure_1.MarginfiAccount(this.address, data);
    }
    describe() {
        return this._marginfiAccount.describe(this.client.banks, this.client.oraclePrices);
    }
}
exports.MarginfiAccountWrapper = MarginfiAccountWrapper;
