import { Environment, MarginfiConfig } from "./types";
import { Infer } from "superstruct";
declare const MarginfiConfigRaw: import("superstruct").Struct<{
    group: string;
    label: "production" | "alpha" | "staging" | "dev" | "mainnet-test-1" | "dev.1";
    cluster: string;
    program: string;
}, {
    label: import("superstruct").Struct<"production" | "alpha" | "staging" | "dev" | "mainnet-test-1" | "dev.1", {
        production: "production";
        alpha: "alpha";
        staging: "staging";
        dev: "dev";
        "mainnet-test-1": "mainnet-test-1";
        "dev.1": "dev.1";
    }>;
    cluster: import("superstruct").Struct<string, null>;
    program: import("superstruct").Struct<string, null>;
    group: import("superstruct").Struct<string, null>;
}>;
declare const ConfigRaw: import("superstruct").Struct<{
    group: string;
    label: "production" | "alpha" | "staging" | "dev" | "mainnet-test-1" | "dev.1";
    cluster: string;
    program: string;
}[], import("superstruct").Struct<{
    group: string;
    label: "production" | "alpha" | "staging" | "dev" | "mainnet-test-1" | "dev.1";
    cluster: string;
    program: string;
}, {
    label: import("superstruct").Struct<"production" | "alpha" | "staging" | "dev" | "mainnet-test-1" | "dev.1", {
        production: "production";
        alpha: "alpha";
        staging: "staging";
        dev: "dev";
        "mainnet-test-1": "mainnet-test-1";
        "dev.1": "dev.1";
    }>;
    cluster: import("superstruct").Struct<string, null>;
    program: import("superstruct").Struct<string, null>;
    group: import("superstruct").Struct<string, null>;
}>>;
export type MarginfiConfigRaw = Infer<typeof MarginfiConfigRaw>;
export type ConfigRaw = Infer<typeof ConfigRaw>;
/**
 * Retrieve config per environment
 */
export declare function getConfig(environment?: Environment, overrides?: Partial<Omit<MarginfiConfig, "environment">>): MarginfiConfig;
export {};
//# sourceMappingURL=config.d.ts.map