"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountType = exports.BankVaultType = void 0;
/**
 * Marginfi bank vault type
 */
var BankVaultType;
(function (BankVaultType) {
    BankVaultType[BankVaultType["LiquidityVault"] = 0] = "LiquidityVault";
    BankVaultType[BankVaultType["InsuranceVault"] = 1] = "InsuranceVault";
    BankVaultType[BankVaultType["FeeVault"] = 2] = "FeeVault";
})(BankVaultType = exports.BankVaultType || (exports.BankVaultType = {}));
// --- On-chain account structs
var AccountType;
(function (AccountType) {
    AccountType["MarginfiGroup"] = "marginfiGroup";
    AccountType["MarginfiAccount"] = "marginfiAccount";
    AccountType["Bank"] = "bank";
})(AccountType = exports.AccountType || (exports.AccountType = {}));
