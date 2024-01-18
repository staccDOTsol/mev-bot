/// <reference types="node" />
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { MarginfiProgram } from "../types";
import { InstructionsWrapper } from "@mrgnlabs/mrgn-common";
interface MarginfiGroupRaw {
    admin: PublicKey;
    padding0: BN[];
    padding1: BN[];
}
export type { MarginfiGroupRaw };
declare class MarginfiGroup {
    address: PublicKey;
    admin: PublicKey;
    constructor(admin: PublicKey, address: PublicKey);
    static fromAccountParsed(address: PublicKey, accountData: MarginfiGroupRaw): MarginfiGroup;
    static fromBuffer(address: PublicKey, rawData: Buffer): MarginfiGroup;
    static decode(encoded: Buffer): MarginfiGroupRaw;
    static encode(decoded: MarginfiGroupRaw): Promise<Buffer>;
    makeEnableFlashLoanForAccountIx(program: MarginfiProgram, marginfiAccountAddress: PublicKey): Promise<InstructionsWrapper>;
    makeDisableFlashLoanForAccountIx(program: MarginfiProgram, marginfiAccountAddress: PublicKey): Promise<InstructionsWrapper>;
}
export { MarginfiGroup };
//# sourceMappingURL=group.d.ts.map