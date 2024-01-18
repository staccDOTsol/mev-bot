"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeVersionedTransaction = exports.makeUnwrapSolIx = exports.makeWrapSolIxs = exports.getBankVaultAuthority = exports.getBankVaultSeeds = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
const types_1 = require("./types");
const mrgn_common_1 = require("@mrgnlabs/mrgn-common");
function getBankVaultSeeds(type) {
    switch (type) {
        case types_1.BankVaultType.LiquidityVault:
            return constants_1.PDA_BANK_LIQUIDITY_VAULT_SEED;
        case types_1.BankVaultType.InsuranceVault:
            return constants_1.PDA_BANK_INSURANCE_VAULT_SEED;
        case types_1.BankVaultType.FeeVault:
            return constants_1.PDA_BANK_FEE_VAULT_SEED;
        default:
            throw Error(`Unknown vault type ${type}`);
    }
}
exports.getBankVaultSeeds = getBankVaultSeeds;
function getBankVaultAuthoritySeeds(type) {
    switch (type) {
        case types_1.BankVaultType.LiquidityVault:
            return constants_1.PDA_BANK_LIQUIDITY_VAULT_AUTH_SEED;
        case types_1.BankVaultType.InsuranceVault:
            return constants_1.PDA_BANK_INSURANCE_VAULT_AUTH_SEED;
        case types_1.BankVaultType.FeeVault:
            return constants_1.PDA_BANK_FEE_VAULT_AUTH_SEED;
        default:
            throw Error(`Unknown vault type ${type}`);
    }
}
/**
 * Compute authority PDA for a specific marginfi group bank vault
 */
function getBankVaultAuthority(bankVaultType, bankPk, programId) {
    return web3_js_1.PublicKey.findProgramAddressSync([getBankVaultAuthoritySeeds(bankVaultType), bankPk.toBuffer()], programId);
}
exports.getBankVaultAuthority = getBankVaultAuthority;
function makeWrapSolIxs(walletAddress, amount) {
    const address = (0, mrgn_common_1.getAssociatedTokenAddressSync)(mrgn_common_1.NATIVE_MINT, walletAddress, true);
    const ixs = [(0, mrgn_common_1.createAssociatedTokenAccountIdempotentInstruction)(walletAddress, address, walletAddress, mrgn_common_1.NATIVE_MINT)];
    if (amount.gt(0)) {
        const nativeAmount = (0, mrgn_common_1.uiToNative)(amount, 9).toNumber() + 10000;
        ixs.push(web3_js_1.SystemProgram.transfer({ fromPubkey: walletAddress, toPubkey: address, lamports: nativeAmount }), (0, mrgn_common_1.createSyncNativeInstruction)(address));
    }
    return ixs;
}
exports.makeWrapSolIxs = makeWrapSolIxs;
function makeUnwrapSolIx(walletAddress) {
    const address = (0, mrgn_common_1.getAssociatedTokenAddressSync)(mrgn_common_1.NATIVE_MINT, walletAddress, true); // We allow off curve addresses here to support Fuse.
    return (0, mrgn_common_1.createCloseAccountInstruction)(address, walletAddress, walletAddress);
}
exports.makeUnwrapSolIx = makeUnwrapSolIx;
async function makeVersionedTransaction(blockhash, transaction, payer, addressLookupTables) {
    const message = new web3_js_1.TransactionMessage({
        instructions: transaction.instructions,
        payerKey: payer,
        recentBlockhash: blockhash,
    });
    const versionedMessage = addressLookupTables
        ? message.compileToV0Message(addressLookupTables)
        : message.compileToLegacyMessage();
    return new web3_js_1.VersionedTransaction(versionedMessage);
}
exports.makeVersionedTransaction = makeVersionedTransaction;
