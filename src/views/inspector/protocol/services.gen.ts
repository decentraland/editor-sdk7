/* eslint-disable */
import _m0 from "protobufjs/minimal";

export const protobufPackage = "decentraland.editor.sdk7";

export interface ComponentDefinition {
  /** Component name, the ID is calculated from this param */
  name: string;
  /** Schema description serialized as JSON */
  schemaDescription: string;
}

export interface Asset {
  /** Asset name */
  name: string;
  /** The asset path if it's reachable */
  imagePath: string;
  /** The asset binary data if the path it's not reachable */
  imageData: Uint8Array;
}

export interface InitResponse {
  /** ECS binary state serialized by the CRDT protocol */
  state: Uint8Array;
  /** Custom components */
  components: ComponentDefinition[];
  /** Assets available */
  assets: Asset[];
}

export interface InitRequest {
}

function createBaseComponentDefinition(): ComponentDefinition {
  return { name: "", schemaDescription: "" };
}

export const ComponentDefinition = {
  encode(message: ComponentDefinition, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.schemaDescription !== "") {
      writer.uint32(18).string(message.schemaDescription);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ComponentDefinition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseComponentDefinition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.schemaDescription = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): ComponentDefinition {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      schemaDescription: isSet(object.schemaDescription) ? String(object.schemaDescription) : "",
    };
  },

  toJSON(message: ComponentDefinition): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.schemaDescription !== undefined && (obj.schemaDescription = message.schemaDescription);
    return obj;
  },

  create<I extends Exact<DeepPartial<ComponentDefinition>, I>>(base?: I): ComponentDefinition {
    return ComponentDefinition.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<ComponentDefinition>, I>>(object: I): ComponentDefinition {
    const message = createBaseComponentDefinition();
    message.name = object.name ?? "";
    message.schemaDescription = object.schemaDescription ?? "";
    return message;
  },
};

function createBaseAsset(): Asset {
  return { name: "", imagePath: "", imageData: new Uint8Array() };
}

export const Asset = {
  encode(message: Asset, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.imagePath !== "") {
      writer.uint32(18).string(message.imagePath);
    }
    if (message.imageData.length !== 0) {
      writer.uint32(26).bytes(message.imageData);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Asset {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAsset();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.imagePath = reader.string();
          break;
        case 3:
          message.imageData = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Asset {
    return {
      name: isSet(object.name) ? String(object.name) : "",
      imagePath: isSet(object.imagePath) ? String(object.imagePath) : "",
      imageData: isSet(object.imageData) ? bytesFromBase64(object.imageData) : new Uint8Array(),
    };
  },

  toJSON(message: Asset): unknown {
    const obj: any = {};
    message.name !== undefined && (obj.name = message.name);
    message.imagePath !== undefined && (obj.imagePath = message.imagePath);
    message.imageData !== undefined &&
      (obj.imageData = base64FromBytes(message.imageData !== undefined ? message.imageData : new Uint8Array()));
    return obj;
  },

  create<I extends Exact<DeepPartial<Asset>, I>>(base?: I): Asset {
    return Asset.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<Asset>, I>>(object: I): Asset {
    const message = createBaseAsset();
    message.name = object.name ?? "";
    message.imagePath = object.imagePath ?? "";
    message.imageData = object.imageData ?? new Uint8Array();
    return message;
  },
};

function createBaseInitResponse(): InitResponse {
  return { state: new Uint8Array(), components: [], assets: [] };
}

export const InitResponse = {
  encode(message: InitResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.state.length !== 0) {
      writer.uint32(10).bytes(message.state);
    }
    for (const v of message.components) {
      ComponentDefinition.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.assets) {
      Asset.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InitResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInitResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.state = reader.bytes();
          break;
        case 2:
          message.components.push(ComponentDefinition.decode(reader, reader.uint32()));
          break;
        case 3:
          message.assets.push(Asset.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): InitResponse {
    return {
      state: isSet(object.state) ? bytesFromBase64(object.state) : new Uint8Array(),
      components: Array.isArray(object?.components)
        ? object.components.map((e: any) => ComponentDefinition.fromJSON(e))
        : [],
      assets: Array.isArray(object?.assets) ? object.assets.map((e: any) => Asset.fromJSON(e)) : [],
    };
  },

  toJSON(message: InitResponse): unknown {
    const obj: any = {};
    message.state !== undefined &&
      (obj.state = base64FromBytes(message.state !== undefined ? message.state : new Uint8Array()));
    if (message.components) {
      obj.components = message.components.map((e) => e ? ComponentDefinition.toJSON(e) : undefined);
    } else {
      obj.components = [];
    }
    if (message.assets) {
      obj.assets = message.assets.map((e) => e ? Asset.toJSON(e) : undefined);
    } else {
      obj.assets = [];
    }
    return obj;
  },

  create<I extends Exact<DeepPartial<InitResponse>, I>>(base?: I): InitResponse {
    return InitResponse.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<InitResponse>, I>>(object: I): InitResponse {
    const message = createBaseInitResponse();
    message.state = object.state ?? new Uint8Array();
    message.components = object.components?.map((e) => ComponentDefinition.fromPartial(e)) || [];
    message.assets = object.assets?.map((e) => Asset.fromPartial(e)) || [];
    return message;
  },
};

function createBaseInitRequest(): InitRequest {
  return {};
}

export const InitRequest = {
  encode(_: InitRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): InitRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseInitRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): InitRequest {
    return {};
  },

  toJSON(_: InitRequest): unknown {
    const obj: any = {};
    return obj;
  },

  create<I extends Exact<DeepPartial<InitRequest>, I>>(base?: I): InitRequest {
    return InitRequest.fromPartial(base ?? {});
  },

  fromPartial<I extends Exact<DeepPartial<InitRequest>, I>>(_: I): InitRequest {
    const message = createBaseInitRequest();
    return message;
  },
};

export type DataServiceDefinition = typeof DataServiceDefinition;
export const DataServiceDefinition = {
  name: "DataService",
  fullName: "decentraland.editor.sdk7.DataService",
  methods: {
    init: {
      name: "Init",
      requestType: InitRequest,
      requestStream: false,
      responseType: InitResponse,
      responseStream: false,
      options: {},
    },
  },
} as const;

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var tsProtoGlobalThis: any = (() => {
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

function bytesFromBase64(b64: string): Uint8Array {
  if (tsProtoGlobalThis.Buffer) {
    return Uint8Array.from(tsProtoGlobalThis.Buffer.from(b64, "base64"));
  } else {
    const bin = tsProtoGlobalThis.atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; ++i) {
      arr[i] = bin.charCodeAt(i);
    }
    return arr;
  }
}

function base64FromBytes(arr: Uint8Array): string {
  if (tsProtoGlobalThis.Buffer) {
    return tsProtoGlobalThis.Buffer.from(arr).toString("base64");
  } else {
    const bin: string[] = [];
    arr.forEach((byte) => {
      bin.push(String.fromCharCode(byte));
    });
    return tsProtoGlobalThis.btoa(bin.join(""));
  }
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends { $case: string } ? { [K in keyof Omit<T, "$case">]?: DeepPartial<T[K]> } & { $case: T["$case"] }
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
