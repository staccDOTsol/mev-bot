"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@coral-xyz/anchor");
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const web3_js_1 = require("@solana/web3.js");
const types_1 = require("./types");
const idl_1 = require("./idl");
const config_1 = require("./config");
const instructions_1 = __importDefault(require("./instructions"));
const account_1 = require("./models/account");
const mrgn_common_1 = require("@mrgnlabs/mrgn-common");
const group_1 = require("./models/group");
const _1 = require(".");
const wrapper_1 = require("./models/account/wrapper");
const errors_1 = require("./errors");
/**
 * Entrypoint to interact with the marginfi contract.
 */
class MarginfiClient {
    // --------------------------------------------------------------------------
    // Factories
    // --------------------------------------------------------------------------
    constructor(config, program, wallet, isReadOnly, group, banks, priceInfos, addressLookupTables, preloadedBankAddresses, bankMetadataMap) {
        this.config = config;
        this.program = program;
        this.wallet = wallet;
        this.isReadOnly = isReadOnly;
        this.bankMetadataMap = bankMetadataMap;
        this.group = group;
        this.banks = banks;
        this.oraclePrices = priceInfos;
        this.addressLookupTables = addressLookupTables ?? [];
        this.preloadedBankAddresses = preloadedBankAddresses;
    }
    /**
     * MarginfiClient factory
     *
     * Fetch account data according to the config and instantiate the corresponding MarginfiAccount.
     *
     * @param config marginfi config
     * @param wallet User wallet (used to pay fees and sign transactions)
     * @param connection Solana web.js Connection object
     * @param opts Solana web.js ConfirmOptions object
     * @param readOnly Whether the client should be read-only or not
     * @param { preloadedBankAddresses } Optional list of bank addresses to skip the gpa call
     * @returns MarginfiClient instance
     */
    static async fetch(config, wallet, connection, opts, readOnly = false, { preloadedBankAddresses } = {}) {
        const debug = require("debug")("mfi:client");
        debug("Loading Marginfi Client\n\tprogram: %s\n\tenv: %s\n\tgroup: %s\n\turl: %s", config.programId, config.environment, config.groupPk, connection.rpcEndpoint);
        const provider = new anchor_1.AnchorProvider(connection, wallet, {
            ...anchor_1.AnchorProvider.defaultOptions(),
            commitment: connection.commitment ?? anchor_1.AnchorProvider.defaultOptions().commitment,
            ...opts,
        });
        const program = new anchor_1.Program(idl_1.MARGINFI_IDL, config.programId, provider);
        let bankMetadataMap = undefined;
        try {
            bankMetadataMap = await (0, mrgn_common_1.loadBankMetadatas)();
        }
        catch (error) {
            console.error("Failed to load bank metadatas. Convenience getter by symbol will not be available", error);
        }
        const { marginfiGroup, banks, priceInfos } = await MarginfiClient.fetchGroupData(program, config.groupPk, connection.commitment, preloadedBankAddresses, bankMetadataMap);
        const addressLookupTableAddresses = _1.ADDRESS_LOOKUP_TABLE_FOR_GROUP[config.groupPk.toString()] ?? [];
        debug("Fetching address lookup tables for %s", addressLookupTableAddresses);
        const addressLookupTables = (await Promise.all(addressLookupTableAddresses.map((address) => connection.getAddressLookupTable(address))))
            .map((response) => response.value)
            .filter((table) => table !== null);
        return new MarginfiClient(config, program, wallet, readOnly, marginfiGroup, banks, priceInfos, addressLookupTables, preloadedBankAddresses, bankMetadataMap);
    }
    static async fromEnv(overrides) {
        const debug = require("debug")("mfi:client");
        const env = overrides?.env ?? process.env.MARGINFI_ENV;
        const connection = overrides?.connection ??
            new web3_js_1.Connection(process.env.MARGINFI_RPC_ENDPOINT, {
                commitment: mrgn_common_1.DEFAULT_COMMITMENT,
            });
        const programId = overrides?.programId ?? new web3_js_1.PublicKey(process.env.MARGINFI_PROGRAM);
        const groupPk = overrides?.marginfiGroup ??
            (process.env.MARGINFI_GROUP ? new web3_js_1.PublicKey(process.env.MARGINFI_GROUP) : web3_js_1.PublicKey.default);
        const wallet = overrides?.wallet ??
            new mrgn_common_1.NodeWallet(process.env.MARGINFI_WALLET_KEY
                ? web3_js_1.Keypair.fromSecretKey(new Uint8Array(JSON.parse(process.env.MARGINFI_WALLET_KEY)))
                : (0, mrgn_common_1.loadKeypair)(process.env.MARGINFI_WALLET));
        debug("Loading the marginfi client from env vars");
        debug("Env: %s\nProgram: %s\nGroup: %s\nSigner: %s", env, programId, groupPk, wallet.publicKey);
        const config = await (0, config_1.getConfig)(env, {
            groupPk: (0, anchor_1.translateAddress)(groupPk),
            programId: (0, anchor_1.translateAddress)(programId),
        });
        return MarginfiClient.fetch(config, wallet, connection, {
            commitment: connection.commitment,
        });
    }
    // NOTE: 2 RPC calls
    // Pass in bankAddresses to skip the gpa call
    static async fetchGroupData(program, groupAddress, commitment, bankAddresses, bankMetadataMap) {
        const debug = require("debug")("mfi:client");
        // Fetch & shape all accounts of Bank type (~ bank discovery)
        let bankDatasKeyed = [];
        if (bankAddresses && bankAddresses.length > 0) {
            debug("Using preloaded bank addresses, skipping gpa call", bankAddresses.length, "banks");
            let bankAccountsData = await program.account.bank.fetchMultiple(bankAddresses);
            for (let i = 0; i < bankAccountsData.length; i++) {
                bankDatasKeyed.push({
                    address: bankAddresses[i],
                    data: bankAccountsData[i],
                });
            }
        }
        else {
            let bankAccountsData = await program.account.bank.all([
                { memcmp: { offset: 8 + 32 + 1, bytes: groupAddress.toBase58() } },
            ]);
            bankDatasKeyed = bankAccountsData.map((account) => ({
                address: account.publicKey,
                data: account.account,
            }));
        }
        // Batch-fetch the group account and all the oracle accounts as per the banks retrieved above
        const [groupAi, ...priceFeedAis] = await program.provider.connection.getMultipleAccountsInfo([groupAddress, ...bankDatasKeyed.map((b) => b.data.config.oracleKeys[0])], commitment); // NOTE: This will break if/when we start having more than 1 oracle key per bank
        // Unpack raw data for group and oracles, and build the `Bank`s map
        if (!groupAi)
            throw new Error("Failed to fetch the on-chain group data");
        const marginfiGroup = group_1.MarginfiGroup.fromBuffer(groupAddress, groupAi.data);
        debug("Decoding bank data");
        const banks = new Map(bankDatasKeyed.map(({ address, data }) => {
            const bankMetadata = bankMetadataMap ? bankMetadataMap[address.toBase58()] : undefined;
            return [address.toBase58(), _1.Bank.fromAccountParsed(address, data, bankMetadata)];
        }));
        debug("Decoded banks");
        const priceInfos = new Map(bankDatasKeyed.map(({ address: bankAddress, data: bankData }, index) => {
            const priceDataRaw = priceFeedAis[index];
            if (!priceDataRaw)
                throw new Error(`Failed to fetch price oracle account for bank ${bankAddress.toBase58()}`);
            const oracleSetup = (0, _1.parseOracleSetup)(bankData.config.oracleSetup);
            return [bankAddress.toBase58(), (0, _1.parsePriceInfo)(oracleSetup, priceDataRaw.data)];
        }));
        debug("Fetched %s banks and %s price feeds", banks.size, priceInfos.size);
        return {
            marginfiGroup,
            banks,
            priceInfos,
        };
    }
    async reload() {
        const { marginfiGroup, banks, priceInfos } = await MarginfiClient.fetchGroupData(this.program, this.config.groupPk, this.program.provider.connection.commitment, this.preloadedBankAddresses);
        this.group = marginfiGroup;
        this.banks = banks;
        this.oraclePrices = priceInfos;
    }
    // --------------------------------------------------------------------------
    // Attributes
    // --------------------------------------------------------------------------
    get groupAddress() {
        return this.config.groupPk;
    }
    get provider() {
        return this.program.provider;
    }
    get programId() {
        return this.program.programId;
    }
    async getAllMarginfiAccountPubkeys() {
        return (await this.provider.connection.getProgramAccounts(this.programId, {
            filters: [
                {
                    memcmp: {
                        bytes: this.config.groupPk.toBase58(),
                        offset: 8, // marginfiGroup is the first field in the account, so only offset is the discriminant
                    },
                },
            ],
            dataSlice: { offset: 0, length: 0 },
        })).map((a) => a.pubkey);
    }
    /**
     * Fetches multiple marginfi accounts based on an array of public keys using the getMultipleAccounts RPC call.
     *
     * @param pubkeys - The public keys of the marginfi accounts to fetch.
     * @returns An array of MarginfiAccountWrapper instances.
     */
    async getMultipleMarginfiAccounts(pubkeys) {
        require("debug")("mfi:client")("Fetching %s marginfi accounts", pubkeys);
        const accounts = await this.program.account.marginfiAccount.fetchMultiple(pubkeys);
        return accounts.map((account, index) => {
            if (!account) {
                throw new Error(`Account not found for pubkey: ${pubkeys[index].toBase58()}`);
            }
            return wrapper_1.MarginfiAccountWrapper.fromAccountParsed(pubkeys[index], this, account);
        });
    }
    /**
     * Retrieves the addresses of all marginfi accounts in the underlying group.
     *
     * @returns Account addresses
     */
    async getAllMarginfiAccountAddresses() {
        return (await this.program.provider.connection.getProgramAccounts(this.programId, {
            commitment: this.program.provider.connection.commitment,
            dataSlice: {
                offset: 0,
                length: 0,
            },
            filters: [
                {
                    memcmp: {
                        bytes: this.groupAddress.toBase58(),
                        offset: 8, // marginfiGroup is the second field in the account after the authority, so offset by the discriminant and a pubkey
                    },
                },
                {
                    memcmp: {
                        offset: 0,
                        bytes: bytes_1.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator(types_1.AccountType.MarginfiAccount)),
                    },
                },
            ],
        })).map((a) => a.pubkey);
    }
    /**
     * Retrieves all marginfi accounts under the specified authority.
     *
     * @returns MarginfiAccount instances
     */
    async getMarginfiAccountsForAuthority(authority) {
        const _authority = authority ? (0, anchor_1.translateAddress)(authority) : this.provider.wallet.publicKey;
        const marginfiAccounts = (await this.program.account.marginfiAccount.all([
            {
                memcmp: {
                    bytes: this.groupAddress.toBase58(),
                    offset: 8, // marginfiGroup is the first field in the account, so only offset is the discriminant
                },
            },
            {
                memcmp: {
                    bytes: _authority.toBase58(),
                    offset: 8 + 32, // authority is the second field in the account after the authority, so offset by the discriminant and a pubkey
                },
            },
        ])).map((a) => wrapper_1.MarginfiAccountWrapper.fromAccountParsed(a.publicKey, this, a.account));
        marginfiAccounts.sort((accountA, accountB) => {
            const assetsValueA = accountA.computeHealthComponents(account_1.MarginRequirementType.Equity).assets;
            const assetsValueB = accountB.computeHealthComponents(account_1.MarginRequirementType.Equity).assets;
            if (assetsValueA.eq(assetsValueB))
                return 0;
            return assetsValueA.gt(assetsValueB) ? -1 : 1;
        });
        return marginfiAccounts;
    }
    /**
     * Retrieves the addresses of all accounts owned by the marginfi program.
     *
     * @returns Account addresses
     */
    async getAllProgramAccountAddresses(type) {
        return (await this.program.provider.connection.getProgramAccounts(this.programId, {
            commitment: this.program.provider.connection.commitment,
            dataSlice: {
                offset: 0,
                length: 0,
            },
            filters: [
                {
                    memcmp: {
                        offset: 0,
                        bytes: bytes_1.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator(type)),
                    },
                },
            ],
        })).map((a) => a.pubkey);
    }
    getBankByPk(bankAddress) {
        let _bankAddress = (0, anchor_1.translateAddress)(bankAddress);
        return this.banks.get(_bankAddress.toString()) ?? null;
    }
    getBankByMint(mint) {
        const _mint = (0, anchor_1.translateAddress)(mint);
        return [...this.banks.values()].find((bank) => bank.mint.equals(_mint)) ?? null;
    }
    getBankByTokenSymbol(tokenSymbol) {
        if (tokenSymbol === undefined)
            return null;
        return [...this.banks.values()].find((bank) => bank.tokenSymbol === tokenSymbol) ?? null;
    }
    getOraclePriceByBank(bankAddress) {
        let _bankAddress = (0, anchor_1.translateAddress)(bankAddress);
        return this.oraclePrices.get(_bankAddress.toString()) ?? null;
    }
    // --------------------------------------------------------------------------
    // User actions
    // --------------------------------------------------------------------------
    /**
     * Create transaction instruction to create a new marginfi account under the authority of the user.
     *
     * @returns transaction instruction
     */
    async makeCreateMarginfiAccountIx(marginfiAccountPk) {
        const dbg = require("debug")("mfi:client");
        dbg("Generating marginfi account ix for %s", marginfiAccountPk);
        const initMarginfiAccountIx = await instructions_1.default.makeInitMarginfiAccountIx(this.program, {
            marginfiGroupPk: this.groupAddress,
            marginfiAccountPk,
            authorityPk: this.provider.wallet.publicKey,
            feePayerPk: this.provider.wallet.publicKey,
        });
        const ixs = [initMarginfiAccountIx];
        return {
            instructions: ixs,
            keys: [],
        };
    }
    /**
     * Create a new marginfi account under the authority of the user.
     *
     * @returns MarginfiAccount instance
     */
    async createMarginfiAccount(opts, createOpts) {
        const dbg = require("debug")("mfi:client");
        const accountKeypair = web3_js_1.Keypair.generate();
        const newAccountKey = createOpts?.newAccountKey ?? accountKeypair.publicKey;
        const ixs = await this.makeCreateMarginfiAccountIx(newAccountKey);
        const signers = [...ixs.keys];
        // If there was no newAccountKey provided, we need to sign with the ephemeraKeypair we generated.
        if (!createOpts?.newAccountKey)
            signers.push(accountKeypair);
        const tx = new web3_js_1.Transaction().add(...ixs.instructions);
        const sig = await this.processTransaction(tx, signers, opts);
        dbg("Created Marginfi account %s", sig);
        return opts?.dryRun
            ? Promise.resolve(undefined)
            : wrapper_1.MarginfiAccountWrapper.fetch(newAccountKey, this, opts?.commitment);
    }
    // --------------------------------------------------------------------------
    // Helpers
    // --------------------------------------------------------------------------
    /**
     * Process a transaction, sign it and send it to the network.
     *
     * @throws ProcessTransactionError
     */
    async processTransaction(transaction, signers, opts) {
        let signature = "";
        let versionedTransaction;
        const connection = new web3_js_1.Connection(this.provider.connection.rpcEndpoint, this.provider.opts);
        let minContextSlot;
        let blockhash;
        let lastValidBlockHeight;
        try {
            const getLatestBlockhashAndContext = await connection.getLatestBlockhashAndContext();
            minContextSlot = getLatestBlockhashAndContext.context.slot - 4;
            blockhash = getLatestBlockhashAndContext.value.blockhash;
            lastValidBlockHeight = getLatestBlockhashAndContext.value.lastValidBlockHeight;
            if (transaction instanceof web3_js_1.Transaction) {
                const versionedMessage = new web3_js_1.TransactionMessage({
                    instructions: transaction.instructions,
                    payerKey: this.provider.publicKey,
                    recentBlockhash: blockhash,
                });
                versionedTransaction = new web3_js_1.VersionedTransaction(versionedMessage.compileToV0Message(this.addressLookupTables));
            }
            else {
                versionedTransaction = transaction;
            }
            if (signers)
                versionedTransaction.sign(signers);
        }
        catch (error) {
            console.log("Failed to build the transaction", error);
            throw new errors_1.ProcessTransactionError(error.message, errors_1.ProcessTransactionErrorType.TransactionBuildingError);
        }
        try {
            if (opts?.dryRun || this.isReadOnly) {
                const response = await connection.simulateTransaction(versionedTransaction, opts ?? { minContextSlot, sigVerify: false });
                console.log(response.value.err ? `❌ Error: ${response.value.err}` : `✅ Success - ${response.value.unitsConsumed} CU`);
                console.log("------ Logs 👇 ------");
                console.log(response.value.logs);
                const signaturesEncoded = encodeURIComponent(JSON.stringify(versionedTransaction.signatures.map((s) => bytes_1.bs58.encode(s))));
                const messageEncoded = encodeURIComponent(Buffer.from(versionedTransaction.message.serialize()).toString("base64"));
                console.log(Buffer.from(versionedTransaction.message.serialize()).toString("base64"));
                const urlEscaped = `https://explorer.solana.com/tx/inspector?cluster=${this.config.cluster}&signatures=${signaturesEncoded}&message=${messageEncoded}`;
                console.log("------ Inspect 👇 ------");
                console.log(urlEscaped);
                if (response.value.err)
                    throw new web3_js_1.SendTransactionError(JSON.stringify(response.value.err), response.value.logs ?? []);
                return versionedTransaction.signatures[0].toString();
            }
            else {
                versionedTransaction = await this.wallet.signTransaction(versionedTransaction);
                let mergedOpts = {
                    ...mrgn_common_1.DEFAULT_CONFIRM_OPTS,
                    commitment: connection.commitment ?? mrgn_common_1.DEFAULT_CONFIRM_OPTS.commitment,
                    preflightCommitment: connection.commitment ?? mrgn_common_1.DEFAULT_CONFIRM_OPTS.commitment,
                    minContextSlot,
                    ...opts,
                };
                signature = await connection.sendTransaction(versionedTransaction, {
                    // minContextSlot: mergedOpts.minContextSlot,
                    skipPreflight: mergedOpts.skipPreflight,
                    preflightCommitment: mergedOpts.preflightCommitment,
                    maxRetries: mergedOpts.maxRetries,
                });
                await connection.confirmTransaction({
                    blockhash,
                    lastValidBlockHeight,
                    signature,
                }, mergedOpts.commitment);
                return signature;
            }
        }
        catch (error) {
            if (error instanceof web3_js_1.SendTransactionError) {
                if (error.logs) {
                    console.log("------ Logs 👇 ------");
                    console.log(error.logs.join("\n"));
                    const errorParsed = (0, errors_1.parseErrorFromLogs)(error.logs, this.config.programId);
                    console.log("Parsed:", errorParsed);
                    throw new errors_1.ProcessTransactionError(errorParsed?.description ?? error.message, errors_1.ProcessTransactionErrorType.SimulationError, error.logs);
                }
            }
            console.log(error);
            throw new errors_1.ProcessTransactionError(error.message, errors_1.ProcessTransactionErrorType.FallthroughError);
        }
    }
    async simulateTransaction(transaction, accountsToInspect) {
        let versionedTransaction;
        const connection = new web3_js_1.Connection(this.provider.connection.rpcEndpoint, this.provider.opts);
        let blockhash;
        try {
            const getLatestBlockhashAndContext = await connection.getLatestBlockhashAndContext();
            blockhash = getLatestBlockhashAndContext.value.blockhash;
            if (transaction instanceof web3_js_1.Transaction) {
                const versionedMessage = new web3_js_1.TransactionMessage({
                    instructions: transaction.instructions,
                    payerKey: this.provider.publicKey,
                    recentBlockhash: blockhash,
                });
                versionedTransaction = new web3_js_1.VersionedTransaction(versionedMessage.compileToV0Message(this.addressLookupTables));
            }
            else {
                versionedTransaction = transaction;
            }
        }
        catch (error) {
            console.log("Failed to build the transaction", error);
            throw new errors_1.ProcessTransactionError(error.message, errors_1.ProcessTransactionErrorType.TransactionBuildingError);
        }
        try {
            const response = await connection.simulateTransaction(versionedTransaction, {
                sigVerify: false,
                accounts: { encoding: "base64", addresses: accountsToInspect.map((a) => a.toBase58()) },
            });
            if (response.value.err)
                throw new Error(JSON.stringify(response.value.err));
            return response.value.accounts?.map((a) => (a ? Buffer.from(a.data[0], "base64") : null)) ?? [];
        }
        catch (error) {
            console.log(error);
            throw new Error("Failed to simulate transaction");
        }
    }
}
exports.default = MarginfiClient;
