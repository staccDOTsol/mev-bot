"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
async function makeInitMarginfiAccountIx(mfProgram, accounts) {
    return mfProgram.methods
        .marginfiAccountInitialize()
        .accounts({
        marginfiGroup: accounts.marginfiGroupPk,
        marginfiAccount: accounts.marginfiAccountPk,
        authority: accounts.authorityPk,
        systemProgram: web3_js_1.SystemProgram.programId,
        feePayer: accounts.feePayerPk,
    })
        .instruction();
}
async function makeDepositIx(mfProgram, accounts, args, remainingAccounts = []) {
    return mfProgram.methods
        .lendingAccountDeposit(args.amount)
        .accounts({
        marginfiGroup: accounts.marginfiGroupPk,
        marginfiAccount: accounts.marginfiAccountPk,
        signer: accounts.authorityPk,
        signerTokenAccount: accounts.signerTokenAccountPk,
        bank: accounts.bankPk,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
}
async function makeRepayIx(mfProgram, accounts, args, remainingAccounts = []) {
    return mfProgram.methods
        .lendingAccountRepay(args.amount, args.repayAll ?? null)
        .accounts({
        marginfiGroup: accounts.marginfiGroupPk,
        marginfiAccount: accounts.marginfiAccountPk,
        signer: accounts.authorityPk,
        signerTokenAccount: accounts.signerTokenAccountPk,
        bank: accounts.bankPk,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
}
async function makeWithdrawIx(mfProgram, accounts, args, remainingAccounts = []) {
    return mfProgram.methods
        .lendingAccountWithdraw(args.amount, args.withdrawAll ?? null)
        .accounts({
        marginfiGroup: accounts.marginfiGroupPk,
        marginfiAccount: accounts.marginfiAccountPk,
        signer: accounts.signerPk,
        destinationTokenAccount: accounts.destinationTokenAccountPk,
        bank: accounts.bankPk,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
}
async function makeBorrowIx(mfProgram, accounts, args, remainingAccounts = []) {
    return mfProgram.methods
        .lendingAccountBorrow(args.amount)
        .accounts({
        marginfiGroup: accounts.marginfiGroupPk,
        marginfiAccount: accounts.marginfiAccountPk,
        signer: accounts.signerPk,
        destinationTokenAccount: accounts.destinationTokenAccountPk,
        bank: accounts.bankPk,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
}
function makeLendingAccountLiquidateIx(mfiProgram, accounts, args, remainingAccounts = []) {
    return mfiProgram.methods
        .lendingAccountLiquidate(args.assetAmount)
        .accounts({
        marginfiGroup: accounts.marginfiGroup,
        signer: accounts.signer,
        assetBank: accounts.assetBank,
        liabBank: accounts.liabBank,
        liquidatorMarginfiAccount: accounts.liquidatorMarginfiAccount,
        liquidateeMarginfiAccount: accounts.liquidateeMarginfiAccount,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
}
function makelendingAccountWithdrawEmissionIx(mfiProgram, accounts) {
    return mfiProgram.methods
        .lendingAccountWithdrawEmissions()
        .accounts({
        marginfiGroup: accounts.marginfiGroup,
        marginfiAccount: accounts.marginfiAccount,
        signer: accounts.signer,
        destinationAccount: accounts.destinationTokenAccount,
        bank: accounts.bank,
        emissionsMint: accounts.emissionsMint,
    })
        .instruction();
}
function makeSetAccountFlagIx(mfiProgram, accounts, args) {
    return mfiProgram.methods
        .setAccountFlag(args.flag)
        .accounts({
        marginfiGroup: accounts.marginfiGroup,
        marginfiAccount: accounts.marginfiAccount,
        admin: accounts.admin,
    })
        .instruction();
}
function makeUnsetAccountFlagIx(mfiProgram, accounts, args) {
    return mfiProgram.methods
        .unsetAccountFlag(args.flag)
        .accounts({
        marginfiGroup: accounts.marginfiGroup,
        marginfiAccount: accounts.marginfiAccount,
        admin: accounts.admin,
    })
        .instruction();
}
function makeBeginFlashLoanIx(mfiProgram, accounts, args) {
    console.log(args.endIndex.toString());
    return mfiProgram.methods
        .lendingAccountStartFlashloan(args.endIndex)
        .accountsStrict({
        marginfiAccount: accounts.marginfiAccount,
        signer: accounts.signer,
        ixsSysvar: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
    })
        .instruction();
}
function makeEndFlashLoanIx(mfiProgram, accounts, remainingAccounts = []) {
    return mfiProgram.methods
        .lendingAccountEndFlashloan()
        .accountsStrict({
        marginfiAccount: accounts.marginfiAccount,
        signer: accounts.signer,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
}
const instructions = {
    makeDepositIx,
    makeRepayIx,
    makeWithdrawIx,
    makeBorrowIx,
    makeInitMarginfiAccountIx,
    makeLendingAccountLiquidateIx,
    makelendingAccountWithdrawEmissionIx,
    makeSetAccountFlagIx,
    makeUnsetAccountFlagIx,
    makeBeginFlashLoanIx,
    makeEndFlashLoanIx,
};
exports.default = instructions;
