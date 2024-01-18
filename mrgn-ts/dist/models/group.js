"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarginfiGroup = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const bn_js_1 = __importDefault(require("bn.js"));
const idl_1 = require("../idl");
const types_1 = require("../types");
const instructions_1 = __importDefault(require("../instructions"));
const constants_1 = require("../constants");
// ----------------------------------------------------------------------------
// Client types
// ----------------------------------------------------------------------------
class MarginfiGroup {
    constructor(admin, address) {
        this.admin = admin;
        this.address = address;
    }
    // ----------------------------------------------------------------------------
    // Factories
    // ----------------------------------------------------------------------------
    static fromAccountParsed(address, accountData) {
        const marginfiGroup = {
            admin: accountData.admin,
        };
        return new MarginfiGroup(marginfiGroup.admin, address);
    }
    static fromBuffer(address, rawData) {
        const data = MarginfiGroup.decode(rawData);
        return MarginfiGroup.fromAccountParsed(address, data);
    }
    static decode(encoded) {
        const coder = new anchor_1.BorshCoder(idl_1.MARGINFI_IDL);
        return coder.accounts.decode(types_1.AccountType.MarginfiGroup, encoded);
    }
    static async encode(decoded) {
        const coder = new anchor_1.BorshCoder(idl_1.MARGINFI_IDL);
        return await coder.accounts.encode(types_1.AccountType.MarginfiGroup, decoded);
    }
    // ----------------------------------------------------------------------------
    // Admin actions
    // ----------------------------------------------------------------------------
    async makeEnableFlashLoanForAccountIx(program, marginfiAccountAddress) {
        const ix = await instructions_1.default.makeSetAccountFlagIx(program, {
            marginfiGroup: this.address,
            marginfiAccount: marginfiAccountAddress,
            admin: this.admin,
        }, { flag: new bn_js_1.default(constants_1.FLASHLOAN_ENABLED_FLAG) });
        return {
            instructions: [ix],
            keys: [],
        };
    }
    async makeDisableFlashLoanForAccountIx(program, marginfiAccountAddress) {
        const ix = await instructions_1.default.makeUnsetAccountFlagIx(program, {
            marginfiGroup: this.address,
            marginfiAccount: marginfiAccountAddress,
            admin: this.admin,
        }, { flag: new bn_js_1.default(constants_1.FLASHLOAN_ENABLED_FLAG) });
        return {
            instructions: [ix],
            keys: [],
        };
    }
}
exports.MarginfiGroup = MarginfiGroup;
