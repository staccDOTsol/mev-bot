import { PublicKey } from "@solana/web3.js";
import { Marginfi } from "./idl/marginfi-types";
import { Program } from "@mrgnlabs/mrgn-common";
export type MarginfiProgram = Program<Marginfi>;
/**
 * Supported config environments.
 */
export type Environment = "production" | "alpha" | "staging" | "dev" | "mainnet-test-1" | "dev.1";
/**
 * Marginfi bank vault type
 */
export declare enum BankVaultType {
    LiquidityVault = 0,
    InsuranceVault = 1,
    FeeVault = 2
}
export interface MarginfiConfig {
    environment: Environment;
    cluster: string;
    programId: PublicKey;
    groupPk: PublicKey;
}
export interface BankAddress {
    label: string;
    address: PublicKey;
}
export declare enum AccountType {
    MarginfiGroup = "marginfiGroup",
    MarginfiAccount = "marginfiAccount",
    Bank = "bank"
}
//# sourceMappingURL=types.d.ts.map