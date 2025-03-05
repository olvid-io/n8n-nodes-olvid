import type { DescField } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"

export type TypeListType = { [key: string]: DescField[] };

export type ResourceOperationListType = { [key: string]: string[] };

export const ScalarProto_Type = {
    1: "number",      // DOUBLE
    2: "number",      // FLOAT
    3: "bigint",      // INT64
    4: "bigint",      // UINT64
    5: "number",      // INT32
    6: "bigint",      // FIXED64
    7: "number",      // FIXED32
    8: "boolean",     // BOOL
    9: "string",      // STRING
    12: "Uint8Array", // BYTES
    13: "number",     // UINT32
    15: "number",     // SFIXED32
    16: "bigint",     // SFIXED64
    17: "number",     // SINT32 (uses ZigZag encoding, still fits in `number`)
    18: "bigint",     // SINT64 (uses ZigZag encoding, needs `bigint`)
} as const;

export const ScalarProto_TypeJson = {
    1: "number",      // DOUBLE
    2: "number",      // FLOAT
    3: "number",      // INT64
    4: "number",      // UINT64
    5: "number",      // INT32
    6: "number",      // FIXED64
    7: "number",      // FIXED32
    8: "boolean",     // BOOL
    9: "string",      // STRING
    12: "string", // BYTES
    13: "number",     // UINT32
    15: "number",     // SFIXED32
    16: "bigint",     // SFIXED64
    17: "number",     // SINT32 (uses ZigZag encoding, still fits in `number`)
    18: "bigint",     // SINT64 (uses ZigZag encoding, needs `bigint`)
} as const;
