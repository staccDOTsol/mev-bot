/// <reference types="node" />
import * as anchor from "@coral-xyz/anchor";
export declare class Account {
    program: any;
    publicKey: anchor.web3.PublicKey;
    /**
     * Account constructor
     * @param program SwitchboardProgram
     * @param publicKey PublicKey of the on-chain resource
     */
    constructor(program: any, publicKey: anchor.web3.PublicKey);
}
export declare const BUFFER_DISCRIMINATOR: Buffer;
//# sourceMappingURL=account.d.ts.map