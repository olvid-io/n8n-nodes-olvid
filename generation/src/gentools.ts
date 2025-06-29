import type { DescField, DescMessage } from "@bufbuild/protobuf/dist/esm/descriptors";

// field: MessageId id = 1 => messageId: datatypes.MessageId
// field: uint64 id = 1 => id: BigInt
export function getFieldAsAParameter(field: DescField): string {
    return `${field.localName}${field.proto.proto3Optional || field.fieldKind === "list" ? '?' : ""}: ${getFieldTsType(field)}`;
}

export function getFieldTsType(field: DescField): string {
    let prefix = field.message ? getModulePrefixFromFileName(field.message.file.name)
        : field.enum ? getModulePrefixFromFileName(field.enum.file.name) : "";
    return prefix + getProtoType(field);
}

export function getMessageTsType(message: DescMessage, addModule: boolean = false): string {
    return `${addModule ? getModulePrefixFromFileName(message.file.name) : ""}${message.name}`
}

function getModulePrefixFromFileName(fileName: string) {
    return fileName.split("/").slice(-3, -2)[0] + ".";
}

function getProtoType(field: DescField): string {
    let type: string;
    if (field.scalar) {
        type = ScalarProto_Type[field.scalar];
    } else {
        type = field.proto.typeName.split('.').slice(5).join('_');
    }
    if (field.fieldKind === "list") {
        return `${type}[]`;
    }
    return type;
}

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
