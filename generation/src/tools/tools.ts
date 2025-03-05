import type { DescField } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import { ScalarProto_Type } from "./types";

export function getTsType(field: DescField): string {
    return (!field.scalar ? "datatypes." : "") + getProtoType(field, true);
}

export function getProtoType(field: DescField, advanced: boolean = false): string {
    if (field.scalar) {
        return ScalarProto_Type[field.scalar];
    } else {
        let sliceNumber = 1;
        if (advanced) {
            sliceNumber = field.proto.typeName.split('.').length - 5;
        }
        return field.proto.typeName.split('.').slice(-sliceNumber).join('_');
    }
}

export function capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
}


export function decapitalize(input: string): string {
    return input.charAt(0).toLowerCase() + input.slice(1);
}
