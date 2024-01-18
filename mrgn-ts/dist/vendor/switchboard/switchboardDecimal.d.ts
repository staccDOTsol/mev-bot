/// <reference types="node" />
import Big from "big.js";
import BN from "bn.js";
export declare class SwitchboardDecimal {
    /**
     * The part of a floating-point number that represents the significant digits of that number,
     * and that is multiplied by the base, 10, raised to the power of scale to give the actual value of the number.
     */
    mantissa: any;
    /** The number of decimal places to move to the left to yield the actual value. */
    scale: any;
    constructor(fields: {
        mantissa: any;
        scale: any;
    });
    static layout(property: any): any;
    static fromDecoded(obj: {
        mantissa: any;
        scale: any;
    }): SwitchboardDecimal;
    static toEncodable(fields: any): {
        mantissa: any;
        scale: any;
    };
    toJSON(): {
        mantissa: any;
        scale: any;
    };
    static fromJSON(obj: {
        mantissa: string | number | BN | number[] | Uint8Array | Buffer;
        scale: any;
    }): SwitchboardDecimal;
    /**
     * Convert untyped object to a Switchboard decimal, if possible.
     * @param obj raw object to convert from
     * @return SwitchboardDecimal
     */
    static from(obj: {
        mantissa: string | number | BN | number[] | Uint8Array | Buffer;
        scale: any;
    }): SwitchboardDecimal;
    /**
     * Convert a Big.js decimal to a Switchboard decimal.
     * @param big a Big.js decimal
     * @return a SwitchboardDecimal
     */
    static fromBig(big: {
        round: (arg0: number) => any;
        c: {
            join: (arg0: string) => string | number | BN | number[] | Uint8Array | Buffer;
            slice: (arg0: number) => {
                (): any;
                new (): any;
                length: number;
            };
        };
        e: number;
        s: string | number | BN | number[] | Uint8Array | Buffer;
        toNumber: () => any;
    }): SwitchboardDecimal;
    /**
     * SwitchboardDecimal equality comparator.
     * @param other object to compare to.
     * @return true iff equal
     */
    eq(other: {
        mantissa: any;
        scale: any;
    }): any;
    /**
     * Convert SwitchboardDecimal to big.js Big type.
     * @return Big representation
     */
    toBig(): Big.Big;
}
//# sourceMappingURL=switchboardDecimal.d.ts.map