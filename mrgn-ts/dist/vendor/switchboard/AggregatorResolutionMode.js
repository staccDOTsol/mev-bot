"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.layout = exports.fromJSON = exports.fromDecoded = exports.ModeSlidingResolution = exports.ModeRoundResolution = void 0;
const borsh = __importStar(require("@coral-xyz/borsh"));
class ModeRoundResolution {
    constructor() {
        this.discriminator = 0;
        this.kind = "ModeRoundResolution";
    }
    toJSON() {
        return {
            kind: "ModeRoundResolution",
        };
    }
    toEncodable() {
        return {
            ModeRoundResolution: {},
        };
    }
}
exports.ModeRoundResolution = ModeRoundResolution;
ModeRoundResolution.discriminator = 0;
ModeRoundResolution.kind = "ModeRoundResolution";
class ModeSlidingResolution {
    constructor() {
        this.discriminator = 1;
        this.kind = "ModeSlidingResolution";
    }
    toJSON() {
        return {
            kind: "ModeSlidingResolution",
        };
    }
    toEncodable() {
        return {
            ModeSlidingResolution: {},
        };
    }
}
exports.ModeSlidingResolution = ModeSlidingResolution;
ModeSlidingResolution.discriminator = 1;
ModeSlidingResolution.kind = "ModeSlidingResolution";
function fromDecoded(obj) {
    if (typeof obj !== "object") {
        throw new Error("Invalid enum object");
    }
    if ("ModeRoundResolution" in obj) {
        return new ModeRoundResolution();
    }
    if ("ModeSlidingResolution" in obj) {
        return new ModeSlidingResolution();
    }
    throw new Error("Invalid enum object");
}
exports.fromDecoded = fromDecoded;
function fromJSON(obj) {
    switch (obj.kind) {
        case "ModeRoundResolution": {
            return new ModeRoundResolution();
        }
        case "ModeSlidingResolution": {
            return new ModeSlidingResolution();
        }
    }
}
exports.fromJSON = fromJSON;
function layout(property) {
    const ret = borsh.rustEnum([borsh.struct([], "ModeRoundResolution"), borsh.struct([], "ModeSlidingResolution")]);
    if (property !== undefined) {
        return ret.replicate(property);
    }
    return ret;
}
exports.layout = layout;
