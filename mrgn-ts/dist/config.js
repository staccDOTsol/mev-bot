"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const web3_js_1 = require("@solana/web3.js");
const superstruct_1 = require("superstruct");
const configs_json_1 = __importDefault(require("./configs.json"));
const MarginfiConfigRaw = (0, superstruct_1.object)({
    label: (0, superstruct_1.enums)(["production", "alpha", "staging", "dev", "mainnet-test-1", "dev.1"]),
    cluster: (0, superstruct_1.string)(),
    program: (0, superstruct_1.string)(),
    group: (0, superstruct_1.string)(),
});
const ConfigRaw = (0, superstruct_1.array)(MarginfiConfigRaw);
function parseConfig(configRaw) {
    return {
        environment: configRaw.label,
        cluster: configRaw.cluster,
        programId: new web3_js_1.PublicKey(configRaw.program),
        groupPk: new web3_js_1.PublicKey(configRaw.group),
    };
}
function parseConfigs(configRaw) {
    return configRaw.reduce((config, current, _) => ({
        [current.label]: parseConfig(current),
        ...config,
    }), {});
}
function loadDefaultConfig() {
    (0, superstruct_1.assert)(configs_json_1.default, ConfigRaw);
    return parseConfigs(configs_json_1.default);
}
/**
 * Define marginfi-specific config per profile
 *
 * @internal
 */
function getMarginfiConfig(environment, overrides) {
    const defaultConfigs = loadDefaultConfig();
    switch (environment) {
        case "production":
        case "alpha":
        case "staging":
        case "dev":
        case "mainnet-test-1":
        case "dev.1":
            const defaultConfig = defaultConfigs[environment];
            return {
                environment,
                programId: overrides?.programId || defaultConfig.programId,
                groupPk: overrides?.groupPk || defaultConfig.groupPk,
                cluster: overrides?.cluster || defaultConfig.cluster,
            };
        default:
            throw Error(`Unknown environment ${environment}`);
    }
}
/**
 * Retrieve config per environment
 */
function getConfig(environment = "production", overrides) {
    return {
        ...getMarginfiConfig(environment, overrides),
    };
}
exports.getConfig = getConfig;
