'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.BundleResult =
  exports.InternalError =
  exports.SimulationFailure =
  exports.StateAuctionBidRejected =
  exports.WinningBatchBidRejected =
  exports.Rejected =
  exports.Accepted =
  exports.BundleUuid =
  exports.Bundle =
  exports.protobufPackage =
    void 0;
/* eslint-disable */
const Long = require("long");
const _m0 = require("protobufjs/minimal");
const packet_1 = require("./packet");
const shared_1 = require("./shared");
exports.protobufPackage = "bundle";
function createBaseBundle() {
    return { header: undefined, packets: [] };
}
exports.Bundle = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.header !== undefined) {
            shared_1.Header.encode(message.header, writer.uint32(18).fork()).ldelim();
        }
        for (const v of message.packets) {
            packet_1.Packet.encode(v, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBundle();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 2:
                    message.header = shared_1.Header.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.packets.push(packet_1.Packet.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            header: isSet(object.header) ? shared_1.Header.fromJSON(object.header) : undefined,
            packets: Array.isArray(object === null || object === void 0 ? void 0 : object.packets) ? object.packets.map((e) => packet_1.Packet.fromJSON(e)) : [],
        };
    },
    toJSON(message) {
        const obj = {};
        message.header !== undefined && (obj.header = message.header ? shared_1.Header.toJSON(message.header) : undefined);
        if (message.packets) {
            obj.packets = message.packets.map((e) => e ? packet_1.Packet.toJSON(e) : undefined);
        }
        else {
            obj.packets = [];
        }
        return obj;
    },
    create(base) {
        return exports.Bundle.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseBundle();
        message.header = (object.header !== undefined && object.header !== null)
            ? shared_1.Header.fromPartial(object.header)
            : undefined;
        message.packets = ((_a = object.packets) === null || _a === void 0 ? void 0 : _a.map((e) => packet_1.Packet.fromPartial(e))) || [];
        return message;
    },
};
function createBaseBundleUuid() {
    return { bundle: undefined, uuid: "" };
}
exports.BundleUuid = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.bundle !== undefined) {
            exports.Bundle.encode(message.bundle, writer.uint32(10).fork()).ldelim();
        }
        if (message.uuid !== "") {
            writer.uint32(18).string(message.uuid);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBundleUuid();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bundle = exports.Bundle.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.uuid = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            bundle: isSet(object.bundle) ? exports.Bundle.fromJSON(object.bundle) : undefined,
            uuid: isSet(object.uuid) ? String(object.uuid) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.bundle !== undefined && (obj.bundle = message.bundle ? exports.Bundle.toJSON(message.bundle) : undefined);
        message.uuid !== undefined && (obj.uuid = message.uuid);
        return obj;
    },
    create(base) {
        return exports.BundleUuid.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseBundleUuid();
        message.bundle = (object.bundle !== undefined && object.bundle !== null)
            ? exports.Bundle.fromPartial(object.bundle)
            : undefined;
        message.uuid = (_a = object.uuid) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseAccepted() {
    return { slot: 0, validatorIdentity: "" };
}
exports.Accepted = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.slot !== 0) {
            writer.uint32(8).uint64(message.slot);
        }
        if (message.validatorIdentity !== "") {
            writer.uint32(18).string(message.validatorIdentity);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseAccepted();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.slot = longToNumber(reader.uint64());
                    break;
                case 2:
                    message.validatorIdentity = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            slot: isSet(object.slot) ? Number(object.slot) : 0,
            validatorIdentity: isSet(object.validatorIdentity) ? String(object.validatorIdentity) : "",
        };
    },
    toJSON(message) {
        const obj = {};
        message.slot !== undefined && (obj.slot = Math.round(message.slot));
        message.validatorIdentity !== undefined && (obj.validatorIdentity = message.validatorIdentity);
        return obj;
    },
    create(base) {
        return exports.Accepted.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseAccepted();
        message.slot = (_a = object.slot) !== null && _a !== void 0 ? _a : 0;
        message.validatorIdentity = (_b = object.validatorIdentity) !== null && _b !== void 0 ? _b : "";
        return message;
    },
};
function createBaseRejected() {
    return {
        stateAuctionBidRejected: undefined,
        winningBatchBidRejected: undefined,
        simulationFailure: undefined,
        internalError: undefined,
    };
}
exports.Rejected = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.stateAuctionBidRejected !== undefined) {
            exports.StateAuctionBidRejected.encode(message.stateAuctionBidRejected, writer.uint32(10).fork()).ldelim();
        }
        if (message.winningBatchBidRejected !== undefined) {
            exports.WinningBatchBidRejected.encode(message.winningBatchBidRejected, writer.uint32(18).fork()).ldelim();
        }
        if (message.simulationFailure !== undefined) {
            exports.SimulationFailure.encode(message.simulationFailure, writer.uint32(26).fork()).ldelim();
        }
        if (message.internalError !== undefined) {
            exports.InternalError.encode(message.internalError, writer.uint32(34).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseRejected();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.stateAuctionBidRejected = exports.StateAuctionBidRejected.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.winningBatchBidRejected = exports.WinningBatchBidRejected.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.simulationFailure = exports.SimulationFailure.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.internalError = exports.InternalError.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            stateAuctionBidRejected: isSet(object.stateAuctionBidRejected)
                ? exports.StateAuctionBidRejected.fromJSON(object.stateAuctionBidRejected)
                : undefined,
            winningBatchBidRejected: isSet(object.winningBatchBidRejected)
                ? exports.WinningBatchBidRejected.fromJSON(object.winningBatchBidRejected)
                : undefined,
            simulationFailure: isSet(object.simulationFailure)
                ? exports.SimulationFailure.fromJSON(object.simulationFailure)
                : undefined,
            internalError: isSet(object.internalError) ? exports.InternalError.fromJSON(object.internalError) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.stateAuctionBidRejected !== undefined && (obj.stateAuctionBidRejected = message.stateAuctionBidRejected
            ? exports.StateAuctionBidRejected.toJSON(message.stateAuctionBidRejected)
            : undefined);
        message.winningBatchBidRejected !== undefined && (obj.winningBatchBidRejected = message.winningBatchBidRejected
            ? exports.WinningBatchBidRejected.toJSON(message.winningBatchBidRejected)
            : undefined);
        message.simulationFailure !== undefined && (obj.simulationFailure = message.simulationFailure
            ? exports.SimulationFailure.toJSON(message.simulationFailure)
            : undefined);
        message.internalError !== undefined &&
            (obj.internalError = message.internalError ? exports.InternalError.toJSON(message.internalError) : undefined);
        return obj;
    },
    create(base) {
        return exports.Rejected.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        const message = createBaseRejected();
        message.stateAuctionBidRejected =
            (object.stateAuctionBidRejected !== undefined && object.stateAuctionBidRejected !== null)
                ? exports.StateAuctionBidRejected.fromPartial(object.stateAuctionBidRejected)
                : undefined;
        message.winningBatchBidRejected =
            (object.winningBatchBidRejected !== undefined && object.winningBatchBidRejected !== null)
                ? exports.WinningBatchBidRejected.fromPartial(object.winningBatchBidRejected)
                : undefined;
        message.simulationFailure = (object.simulationFailure !== undefined && object.simulationFailure !== null)
            ? exports.SimulationFailure.fromPartial(object.simulationFailure)
            : undefined;
        message.internalError = (object.internalError !== undefined && object.internalError !== null)
            ? exports.InternalError.fromPartial(object.internalError)
            : undefined;
        return message;
    },
};
function createBaseWinningBatchBidRejected() {
    return { auctionId: "", simulatedBidLamports: 0, msg: undefined };
}
exports.WinningBatchBidRejected = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.auctionId !== "") {
            writer.uint32(10).string(message.auctionId);
        }
        if (message.simulatedBidLamports !== 0) {
            writer.uint32(16).uint64(message.simulatedBidLamports);
        }
        if (message.msg !== undefined) {
            writer.uint32(26).string(message.msg);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseWinningBatchBidRejected();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.auctionId = reader.string();
                    break;
                case 2:
                    message.simulatedBidLamports = longToNumber(reader.uint64());
                    break;
                case 3:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            auctionId: isSet(object.auctionId) ? String(object.auctionId) : "",
            simulatedBidLamports: isSet(object.simulatedBidLamports) ? Number(object.simulatedBidLamports) : 0,
            msg: isSet(object.msg) ? String(object.msg) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.auctionId !== undefined && (obj.auctionId = message.auctionId);
        message.simulatedBidLamports !== undefined && (obj.simulatedBidLamports = Math.round(message.simulatedBidLamports));
        message.msg !== undefined && (obj.msg = message.msg);
        return obj;
    },
    create(base) {
        return exports.WinningBatchBidRejected.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseWinningBatchBidRejected();
        message.auctionId = (_a = object.auctionId) !== null && _a !== void 0 ? _a : "";
        message.simulatedBidLamports = (_b = object.simulatedBidLamports) !== null && _b !== void 0 ? _b : 0;
        message.msg = (_c = object.msg) !== null && _c !== void 0 ? _c : undefined;
        return message;
    },
};
function createBaseStateAuctionBidRejected() {
    return { auctionId: "", simulatedBidLamports: 0, msg: undefined };
}
exports.StateAuctionBidRejected = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.auctionId !== "") {
            writer.uint32(10).string(message.auctionId);
        }
        if (message.simulatedBidLamports !== 0) {
            writer.uint32(16).uint64(message.simulatedBidLamports);
        }
        if (message.msg !== undefined) {
            writer.uint32(26).string(message.msg);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseStateAuctionBidRejected();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.auctionId = reader.string();
                    break;
                case 2:
                    message.simulatedBidLamports = longToNumber(reader.uint64());
                    break;
                case 3:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            auctionId: isSet(object.auctionId) ? String(object.auctionId) : "",
            simulatedBidLamports: isSet(object.simulatedBidLamports) ? Number(object.simulatedBidLamports) : 0,
            msg: isSet(object.msg) ? String(object.msg) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.auctionId !== undefined && (obj.auctionId = message.auctionId);
        message.simulatedBidLamports !== undefined && (obj.simulatedBidLamports = Math.round(message.simulatedBidLamports));
        message.msg !== undefined && (obj.msg = message.msg);
        return obj;
    },
    create(base) {
        return exports.StateAuctionBidRejected.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b, _c;
        const message = createBaseStateAuctionBidRejected();
        message.auctionId = (_a = object.auctionId) !== null && _a !== void 0 ? _a : "";
        message.simulatedBidLamports = (_b = object.simulatedBidLamports) !== null && _b !== void 0 ? _b : 0;
        message.msg = (_c = object.msg) !== null && _c !== void 0 ? _c : undefined;
        return message;
    },
};
function createBaseSimulationFailure() {
    return { txSignature: "", msg: undefined };
}
exports.SimulationFailure = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.txSignature !== "") {
            writer.uint32(10).string(message.txSignature);
        }
        if (message.msg !== undefined) {
            writer.uint32(18).string(message.msg);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseSimulationFailure();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.txSignature = reader.string();
                    break;
                case 2:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            txSignature: isSet(object.txSignature) ? String(object.txSignature) : "",
            msg: isSet(object.msg) ? String(object.msg) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.txSignature !== undefined && (obj.txSignature = message.txSignature);
        message.msg !== undefined && (obj.msg = message.msg);
        return obj;
    },
    create(base) {
        return exports.SimulationFailure.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a, _b;
        const message = createBaseSimulationFailure();
        message.txSignature = (_a = object.txSignature) !== null && _a !== void 0 ? _a : "";
        message.msg = (_b = object.msg) !== null && _b !== void 0 ? _b : undefined;
        return message;
    },
};
function createBaseInternalError() {
    return { msg: "" };
}
exports.InternalError = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.msg !== "") {
            writer.uint32(10).string(message.msg);
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseInternalError();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.msg = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return { msg: isSet(object.msg) ? String(object.msg) : "" };
    },
    toJSON(message) {
        const obj = {};
        message.msg !== undefined && (obj.msg = message.msg);
        return obj;
    },
    create(base) {
        return exports.InternalError.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseInternalError();
        message.msg = (_a = object.msg) !== null && _a !== void 0 ? _a : "";
        return message;
    },
};
function createBaseBundleResult() {
    return { bundleId: "", accepted: undefined, rejected: undefined };
}
exports.BundleResult = {
    encode(message, writer = _m0.Writer.create()) {
        if (message.bundleId !== "") {
            writer.uint32(10).string(message.bundleId);
        }
        if (message.accepted !== undefined) {
            exports.Accepted.encode(message.accepted, writer.uint32(18).fork()).ldelim();
        }
        if (message.rejected !== undefined) {
            exports.Rejected.encode(message.rejected, writer.uint32(26).fork()).ldelim();
        }
        return writer;
    },
    decode(input, length) {
        const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
        let end = length === undefined ? reader.len : reader.pos + length;
        const message = createBaseBundleResult();
        while (reader.pos < end) {
            const tag = reader.uint32();
            switch (tag >>> 3) {
                case 1:
                    message.bundleId = reader.string();
                    break;
                case 2:
                    message.accepted = exports.Accepted.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.rejected = exports.Rejected.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
            }
        }
        return message;
    },
    fromJSON(object) {
        return {
            bundleId: isSet(object.bundleId) ? String(object.bundleId) : "",
            accepted: isSet(object.accepted) ? exports.Accepted.fromJSON(object.accepted) : undefined,
            rejected: isSet(object.rejected) ? exports.Rejected.fromJSON(object.rejected) : undefined,
        };
    },
    toJSON(message) {
        const obj = {};
        message.bundleId !== undefined && (obj.bundleId = message.bundleId);
        message.accepted !== undefined && (obj.accepted = message.accepted ? exports.Accepted.toJSON(message.accepted) : undefined);
        message.rejected !== undefined && (obj.rejected = message.rejected ? exports.Rejected.toJSON(message.rejected) : undefined);
        return obj;
    },
    create(base) {
        return exports.BundleResult.fromPartial(base !== null && base !== void 0 ? base : {});
    },
    fromPartial(object) {
        var _a;
        const message = createBaseBundleResult();
        message.bundleId = (_a = object.bundleId) !== null && _a !== void 0 ? _a : "";
        message.accepted = (object.accepted !== undefined && object.accepted !== null)
            ? exports.Accepted.fromPartial(object.accepted)
            : undefined;
        message.rejected = (object.rejected !== undefined && object.rejected !== null)
            ? exports.Rejected.fromPartial(object.rejected)
            : undefined;
        return message;
    },
};
var tsProtoGlobalThis = (() => {
    if (typeof globalThis !== "undefined") {
        return globalThis;
    }
    if (typeof self !== "undefined") {
        return self;
    }
    if (typeof window !== "undefined") {
        return window;
    }
    if (typeof global !== "undefined") {
        return global;
    }
    throw "Unable to locate global object";
})();
function longToNumber(long) {
    if (long.gt(Number.MAX_SAFE_INTEGER)) {
        throw new tsProtoGlobalThis.Error("Value is larger than Number.MAX_SAFE_INTEGER");
    }
    return long.toNumber();
}
// If you get a compile-error about 'Constructor<Long> and ... have no overlap',
// add '--ts_proto_opt=esModuleInterop=true' as a flag when calling 'protoc'.
if (_m0.util.Long !== Long) {
    _m0.util.Long = Long;
    _m0.configure();
}
function isSet(value) {
    return value !== null && value !== undefined;
}
//# sourceMappingURL=bundle.js.map