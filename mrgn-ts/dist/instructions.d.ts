/// <reference types="@coral-xyz/anchor/node_modules/@solana/web3.js" />
import { AccountMeta, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { MarginfiProgram } from "./types";
declare function makeInitMarginfiAccountIx(mfProgram: MarginfiProgram, accounts: {
    marginfiGroupPk: PublicKey;
    marginfiAccountPk: PublicKey;
    authorityPk: PublicKey;
    feePayerPk: PublicKey;
}): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeDepositIx(mfProgram: MarginfiProgram, accounts: {
    marginfiGroupPk: PublicKey;
    marginfiAccountPk: PublicKey;
    authorityPk: PublicKey;
    signerTokenAccountPk: PublicKey;
    bankPk: PublicKey;
}, args: {
    amount: BN;
}, remainingAccounts?: AccountMeta[]): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeRepayIx(mfProgram: MarginfiProgram, accounts: {
    marginfiGroupPk: PublicKey;
    marginfiAccountPk: PublicKey;
    authorityPk: PublicKey;
    signerTokenAccountPk: PublicKey;
    bankPk: PublicKey;
}, args: {
    amount: BN;
    repayAll?: boolean;
}, remainingAccounts?: AccountMeta[]): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeWithdrawIx(mfProgram: MarginfiProgram, accounts: {
    marginfiGroupPk: PublicKey;
    marginfiAccountPk: PublicKey;
    signerPk: PublicKey;
    bankPk: PublicKey;
    destinationTokenAccountPk: PublicKey;
}, args: {
    amount: BN;
    withdrawAll?: boolean;
}, remainingAccounts?: AccountMeta[]): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeBorrowIx(mfProgram: MarginfiProgram, accounts: {
    marginfiGroupPk: PublicKey;
    marginfiAccountPk: PublicKey;
    signerPk: PublicKey;
    bankPk: PublicKey;
    destinationTokenAccountPk: PublicKey;
}, args: {
    amount: BN;
}, remainingAccounts?: AccountMeta[]): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeLendingAccountLiquidateIx(mfiProgram: MarginfiProgram, accounts: {
    marginfiGroup: PublicKey;
    signer: PublicKey;
    assetBank: PublicKey;
    liabBank: PublicKey;
    liquidatorMarginfiAccount: PublicKey;
    liquidateeMarginfiAccount: PublicKey;
}, args: {
    assetAmount: BN;
}, remainingAccounts?: AccountMeta[]): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makelendingAccountWithdrawEmissionIx(mfiProgram: MarginfiProgram, accounts: {
    marginfiGroup: PublicKey;
    marginfiAccount: PublicKey;
    signer: PublicKey;
    destinationTokenAccount: PublicKey;
    bank: PublicKey;
    emissionsMint: PublicKey;
}): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeSetAccountFlagIx(mfiProgram: MarginfiProgram, accounts: {
    marginfiGroup: PublicKey;
    marginfiAccount: PublicKey;
    admin: PublicKey;
}, args: {
    flag: BN;
}): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeUnsetAccountFlagIx(mfiProgram: MarginfiProgram, accounts: {
    marginfiGroup: PublicKey;
    marginfiAccount: PublicKey;
    admin: PublicKey;
}, args: {
    flag: BN;
}): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeBeginFlashLoanIx(mfiProgram: MarginfiProgram, accounts: {
    marginfiAccount: PublicKey;
    signer: PublicKey;
}, args: {
    endIndex: BN;
}): Promise<import("@solana/web3.js").TransactionInstruction>;
declare function makeEndFlashLoanIx(mfiProgram: MarginfiProgram, accounts: {
    marginfiAccount: PublicKey;
    signer: PublicKey;
}, remainingAccounts?: AccountMeta[]): Promise<import("@solana/web3.js").TransactionInstruction>;
declare const instructions: {
    makeDepositIx: typeof makeDepositIx;
    makeRepayIx: typeof makeRepayIx;
    makeWithdrawIx: typeof makeWithdrawIx;
    makeBorrowIx: typeof makeBorrowIx;
    makeInitMarginfiAccountIx: typeof makeInitMarginfiAccountIx;
    makeLendingAccountLiquidateIx: typeof makeLendingAccountLiquidateIx;
    makelendingAccountWithdrawEmissionIx: typeof makelendingAccountWithdrawEmissionIx;
    makeSetAccountFlagIx: typeof makeSetAccountFlagIx;
    makeUnsetAccountFlagIx: typeof makeUnsetAccountFlagIx;
    makeBeginFlashLoanIx: typeof makeBeginFlashLoanIx;
    makeEndFlashLoanIx: typeof makeEndFlashLoanIx;
};
export default instructions;
//# sourceMappingURL=instructions.d.ts.map