import * as borsh from "@coral-xyz/borsh";
export declare class ModeRoundResolution {
    static discriminator: number;
    static kind: string;
    discriminator: number;
    kind: string;
    toJSON(): {
        kind: string;
    };
    toEncodable(): {
        ModeRoundResolution: {};
    };
}
export declare class ModeSlidingResolution {
    static discriminator: number;
    static kind: string;
    discriminator: number;
    kind: string;
    toJSON(): {
        kind: string;
    };
    toEncodable(): {
        ModeSlidingResolution: {};
    };
}
export declare function fromDecoded(obj: any): ModeRoundResolution | ModeSlidingResolution;
export declare function fromJSON(obj: any): ModeRoundResolution | ModeSlidingResolution | undefined;
export declare function layout(property: any): borsh.EnumLayout<unknown>;
//# sourceMappingURL=AggregatorResolutionMode.d.ts.map