"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseErrorFromLogs = exports.ProcessTransactionError = exports.ProcessTransactionErrorType = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const mrgn_common_1 = require("@mrgnlabs/mrgn-common");
const marginfi_types_1 = require("./idl/marginfi-types");
var ProcessTransactionErrorType;
(function (ProcessTransactionErrorType) {
    ProcessTransactionErrorType[ProcessTransactionErrorType["TransactionBuildingError"] = 0] = "TransactionBuildingError";
    ProcessTransactionErrorType[ProcessTransactionErrorType["SimulationError"] = 1] = "SimulationError";
    ProcessTransactionErrorType[ProcessTransactionErrorType["FallthroughError"] = 2] = "FallthroughError";
})(ProcessTransactionErrorType = exports.ProcessTransactionErrorType || (exports.ProcessTransactionErrorType = {}));
class ProcessTransactionError extends Error {
    constructor(message, type, logs) {
        super(message);
        this.type = type;
        this.logs = logs;
    }
}
exports.ProcessTransactionError = ProcessTransactionError;
const MFI_ERROR_CODE_MAP = new Map(marginfi_types_1.IDL.errors.map((error) => [error.code, error.msg]));
function parseErrorFromLogs(logs, mfiProgramId) {
    const error = parseCustomProgramError(logs);
    if (error === null) {
        return null;
    }
    let errorMsg = undefined;
    if (error.programId === mfiProgramId.toBase58()) {
        const mfiError = MFI_ERROR_CODE_MAP.get(error.code);
        if (mfiError !== undefined) {
            return { code: error.code, programId: error.programId, description: mfiError };
        }
    }
    let programErrors = ERROR_CODE_MAPS.get(error.programId);
    if (programErrors !== undefined) {
        errorMsg = programErrors.get(error.code);
        if (errorMsg !== undefined) {
            return { code: error.code, programId: error.programId, description: errorMsg };
        }
    }
    errorMsg = anchor_1.LangErrorMessage.get(error.code);
    if (errorMsg !== undefined) {
        return { code: error.code, programId: error.programId, description: errorMsg };
    }
    return null;
}
exports.parseErrorFromLogs = parseErrorFromLogs;
function parseCustomProgramError(logs) {
    const log = logs.find((log) => log.includes("failed: custom program error"));
    if (!log)
        return null;
    const regex = /^Program (?<program>\S+) failed: custom program error: (?<code>0x[0-9a-fA-F]+)/g;
    const match = regex.exec(log);
    if (!match?.groups)
        return null;
    const code = parseInt(match.groups.code);
    return { programId: match.groups.program, code };
}
var TokenErrorCode;
(function (TokenErrorCode) {
    TokenErrorCode[TokenErrorCode["NotRentExempt"] = 0] = "NotRentExempt";
    TokenErrorCode[TokenErrorCode["InsufficientFunds"] = 1] = "InsufficientFunds";
    TokenErrorCode[TokenErrorCode["InvalidMint"] = 2] = "InvalidMint";
    TokenErrorCode[TokenErrorCode["MintMismatch"] = 3] = "MintMismatch";
    TokenErrorCode[TokenErrorCode["OwnerMismatch"] = 4] = "OwnerMismatch";
    TokenErrorCode[TokenErrorCode["FixedSupply"] = 5] = "FixedSupply";
    TokenErrorCode[TokenErrorCode["AlreadyInUse"] = 6] = "AlreadyInUse";
    TokenErrorCode[TokenErrorCode["InvalidNumberOfProvidedSigners"] = 7] = "InvalidNumberOfProvidedSigners";
    TokenErrorCode[TokenErrorCode["InvalidNumberOfRequiredSigners"] = 8] = "InvalidNumberOfRequiredSigners";
    TokenErrorCode[TokenErrorCode["UninitializedState"] = 9] = "UninitializedState";
    TokenErrorCode[TokenErrorCode["NativeNotSupported"] = 10] = "NativeNotSupported";
    TokenErrorCode[TokenErrorCode["NonNativeHasBalance"] = 11] = "NonNativeHasBalance";
    TokenErrorCode[TokenErrorCode["InvalidInstruction"] = 12] = "InvalidInstruction";
    TokenErrorCode[TokenErrorCode["InvalidState"] = 13] = "InvalidState";
    TokenErrorCode[TokenErrorCode["Overflow"] = 14] = "Overflow";
    TokenErrorCode[TokenErrorCode["AuthorityTypeNotSupported"] = 15] = "AuthorityTypeNotSupported";
    TokenErrorCode[TokenErrorCode["MintCannotFreeze"] = 16] = "MintCannotFreeze";
    TokenErrorCode[TokenErrorCode["AccountFrozen"] = 17] = "AccountFrozen";
    TokenErrorCode[TokenErrorCode["MintDecimalsMismatch"] = 18] = "MintDecimalsMismatch";
    TokenErrorCode[TokenErrorCode["NonNativeNotSupported"] = 19] = "NonNativeNotSupported";
})(TokenErrorCode || (TokenErrorCode = {}));
const TokenErrorCodeMap = new Map([
    [TokenErrorCode.NotRentExempt, "Lamport balance below rent-exempt threshold"],
    [TokenErrorCode.InsufficientFunds, "Insufficient funds"],
    [TokenErrorCode.InvalidMint, "Invalid Mint"],
    [TokenErrorCode.MintMismatch, "Account not associated with this Mint"],
    [TokenErrorCode.OwnerMismatch, "Owner does not match"],
    [TokenErrorCode.FixedSupply, "This token's supply is fixed and new tokens cannot be minted"],
    [TokenErrorCode.AlreadyInUse, "The account cannot be initialized because it is already being used"],
    [TokenErrorCode.InvalidNumberOfProvidedSigners, "Invalid number of provided signers"],
    [TokenErrorCode.InvalidNumberOfRequiredSigners, "Invalid number of required signers"],
    [TokenErrorCode.UninitializedState, "State is uninitialized"],
    [TokenErrorCode.NativeNotSupported, "Instruction does not support native tokens"],
    [TokenErrorCode.NonNativeHasBalance, "Non-native account can only be closed if its balance is zero"],
    [TokenErrorCode.InvalidInstruction, "Invalid instruction"],
    [TokenErrorCode.InvalidState, "State is invalid for requested operation"],
    [TokenErrorCode.Overflow, "Operation overflowed"],
    [TokenErrorCode.AuthorityTypeNotSupported, "Account does not support specified authority type"],
    [TokenErrorCode.MintCannotFreeze, "This token mint cannot freeze accounts"],
    [TokenErrorCode.AccountFrozen, "Account is frozen; all account operations will fail"],
    [TokenErrorCode.MintDecimalsMismatch, "Mint decimals mismatch between the client and mint"],
    [TokenErrorCode.NonNativeNotSupported, "Instruction does not support non-native tokens"],
]);
const ERROR_CODE_MAPS = new Map([[mrgn_common_1.TOKEN_PROGRAM_ID.toBase58(), TokenErrorCodeMap]]);
