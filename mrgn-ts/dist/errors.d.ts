import { PublicKey } from "@solana/web3.js";
export declare enum ProcessTransactionErrorType {
    TransactionBuildingError = 0,
    SimulationError = 1,
    FallthroughError = 2
}
export declare class ProcessTransactionError extends Error {
    logs?: string[];
    type: ProcessTransactionErrorType;
    constructor(message: string, type: ProcessTransactionErrorType, logs?: string[]);
}
export interface ProgramError {
    programId: string;
    code: number;
}
export interface ProgramErrorWithDescription extends ProgramError {
    description: string;
}
export declare function parseErrorFromLogs(logs: string[], mfiProgramId: PublicKey): ProgramErrorWithDescription | null;
//# sourceMappingURL=errors.d.ts.map