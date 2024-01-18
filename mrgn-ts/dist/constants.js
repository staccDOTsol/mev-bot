"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FLASHLOAN_ENABLED_FLAG = exports.DISABLED_FLAG = exports.ADDRESS_LOOKUP_TABLE_FOR_GROUP = exports.USDC_DECIMALS = exports.SWB_PRICE_CONF_INTERVALS = exports.PYTH_PRICE_CONF_INTERVALS = exports.PDA_BANK_FEE_VAULT_SEED = exports.PDA_BANK_INSURANCE_VAULT_SEED = exports.PDA_BANK_LIQUIDITY_VAULT_SEED = exports.PDA_BANK_FEE_VAULT_AUTH_SEED = exports.PDA_BANK_INSURANCE_VAULT_AUTH_SEED = exports.PDA_BANK_LIQUIDITY_VAULT_AUTH_SEED = void 0;
const web3_js_1 = require("@solana/web3.js");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.PDA_BANK_LIQUIDITY_VAULT_AUTH_SEED = Buffer.from("liquidity_vault_auth");
exports.PDA_BANK_INSURANCE_VAULT_AUTH_SEED = Buffer.from("insurance_vault_auth");
exports.PDA_BANK_FEE_VAULT_AUTH_SEED = Buffer.from("fee_vault_auth");
exports.PDA_BANK_LIQUIDITY_VAULT_SEED = Buffer.from("liquidity_vault");
exports.PDA_BANK_INSURANCE_VAULT_SEED = Buffer.from("insurance_vault");
exports.PDA_BANK_FEE_VAULT_SEED = Buffer.from("fee_vault");
exports.PYTH_PRICE_CONF_INTERVALS = new bignumber_js_1.default(2.12);
exports.SWB_PRICE_CONF_INTERVALS = new bignumber_js_1.default(2.12);
exports.USDC_DECIMALS = 6;
exports.ADDRESS_LOOKUP_TABLE_FOR_GROUP = {
    "4qp6Fx6tnZkY5Wropq9wUYgtFxXKwE6viZxFHg3rdAG8": [new web3_js_1.PublicKey("2FyGQ8UZ6PegCSN2Lu7QD1U2UY28GpJdDfdwEfbwxN7p")],
};
exports.DISABLED_FLAG = 1 << 0;
exports.FLASHLOAN_ENABLED_FLAG = 1 << 2;
