export declare class Hash {
    /** The bytes used to derive the hash. */
    data: any;
    constructor(fields: {
        data: any;
    });
    static layout(property: any): any;
    static fromDecoded(obj: {
        data: any;
    }): Hash;
    static toEncodable(fields: any): {
        data: any;
    };
    toJSON(): {
        data: any;
    };
    static fromJSON(obj: {
        data: any;
    }): Hash;
    toEncodable(): {
        data: any;
    };
}
//# sourceMappingURL=Hash.d.ts.map