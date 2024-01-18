/// <reference types="node" />
import { AddressLookupTableAccount, Blockhash, PublicKey, Transaction, TransactionInstruction, VersionedTransaction } from "@solana/web3.js";
import { BankVaultType } from "./types";
import BigNumber from "bignumber.js";
export declare function getBankVaultSeeds(type: BankVaultType): Buffer;
/**
 * Compute authority PDA for a specific marginfi group bank vault
 */
export declare function getBankVaultAuthority(bankVaultType: BankVaultType, bankPk: PublicKey, programId: PublicKey): [PublicKey, number];
export declare function makeWrapSolIxs(walletAddress: PublicKey, amount: BigNumber): TransactionInstruction[];
export declare function makeUnwrapSolIx(walletAddress: PublicKey): TransactionInstruction;
export declare function makeVersionedTransaction(blockhash: Blockhash, transaction: Transaction, payer: PublicKey, addressLookupTables?: AddressLookupTableAccount[]): Promise<VersionedTransaction>;
//# sourceMappingURL=utils.d.ts.map