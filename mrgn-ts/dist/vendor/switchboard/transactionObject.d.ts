/// <reference types="@coral-xyz/anchor/node_modules/@solana/web3.js" />
import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
/**
 Compare two instructions to see if a transaction already includes a given type of instruction. Does not compare if the ixn has the same data.
 */
export declare const ixnsEqual: (a: any, b: any) => any;
/**
 Compare two instructions to see if a transaction already includes a given type of instruction. Returns false if the ixn data is different.
 */
export declare const ixnsDeepEqual: (a: any, b: any) => any;
export declare class TransactionObject {
    enableDurableNonce: any;
    computeUnitPrice: any;
    computeUnitLimit: any;
    payer: PublicKey;
    ixns: any[];
    signers: any;
    /** Return the number of instructions, including the durable nonce placeholder if enabled */
    get length(): number;
    constructor(payer: PublicKey, ixns: any, signers: any, options: any);
    /** Build a new transaction with options */
    static new(payer: any, options: any): TransactionObject;
    verify(): void;
    static getComputeUnitLimitIxn(computeUnitLimit: number): import("@solana/web3.js").TransactionInstruction | undefined;
    static getComputeUnitPriceIxn(computeUnitPrice: number): import("@solana/web3.js").TransactionInstruction | undefined;
    /**
     * Append instructions to the beginning of a TransactionObject
     */
    unshift(ixn: any, signers: any): this;
    insert(ixn: any, index: any, signers: any): this;
    /**
     * Append instructions to the end of a TransactionObject
     */
    add(ixn: any, signers: any): this;
    /**
     * Verify a transaction object has less than 10 instructions, less than 1232 bytes, and contains all required signers minus the payer
     * @throws if more than 10 instructions, serialized size is greater than 1232 bytes, or if object is missing a required signer minus the payer
     */
    static verify(payer: any, ixns: any, signers: any, enableDurableNonce: any): void;
    /**
     * Return the serialized size of an array of TransactionInstructions
     */
    static size(payer: PublicKey, ixns: any[]): number;
    get size(): number;
    /**
     * Try to combine two {@linkcode TransactionObject}'s
     * @throws if verification fails. See TransactionObject.verify
     */
    combine(otherObject: {
        payer: PublicKey;
        ixns: any;
        signers: any;
    }): this;
    static verifySigners(payer: {
        toBase58: () => any;
    }, ixns: any[], signers: any[]): void;
    /**
     * Convert the TransactionObject into a Solana Transaction
     */
    toTxn(options: {
        nonceInfo: any;
        minContextSlot: any;
        blockhash: any;
        lastValidBlockHeight: any;
    }): Transaction;
    toVersionedTxn(options: {
        nonceInfo: {
            nonce: any;
        };
        blockhash: any;
    }): VersionedTransaction;
    /**
     * Return a Transaction signed by the provided signers
     */
    sign(options: any, signers: any): Transaction;
}
//# sourceMappingURL=transactionObject.d.ts.map