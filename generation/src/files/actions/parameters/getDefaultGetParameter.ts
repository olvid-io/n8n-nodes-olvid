import { capitalize, getTsType } from "src/tools/tools";
import type { DescField } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"

export function getDefaultGetParameter({
    field,
	itemName = "",
    isOneofField = false,
    isList = false,
    indented = false,
    optional = '',
}: {
    field: DescField,
	itemName?: string,
    isOneofField?: boolean,
    isList?: boolean,
    indented?: boolean,
    optional?: string
}): string {
    const listType = !isList && field.fieldKind === 'list' ? '[]' : '';
    const scalarGet = indented ? `${itemName}['${field.jsonName}']` : `this.getNodeParameter('${field.jsonName}', index)`;
    const nonScalarGet = indented ? `${itemName}` : 'index';
    if (!optional) {
        optional = field.proto.proto3Optional ? ' | undefined' : '';
    }

    if (field.oneof && !isOneofField) {
        return `const ${field.oneof.localName}: ${field.oneof.localName}Type${listType}${optional} = get${capitalize(field.oneof.localName)}.call(this, ${nonScalarGet});`;
    }

    let baseParameter = `const ${field.jsonName}: ${getTsType(field)}${listType}${optional} = `;
    if (!isList && field.fieldKind === 'list') {
        baseParameter += `get${capitalize(field.jsonName)}.call(this, ${nonScalarGet})`;
    }
    else if (field.scalar === undefined) {
        baseParameter += `get${capitalize(field.localName)}.call(this, ${nonScalarGet})`;
    }
	else {
        if (optional) {
            baseParameter += `${scalarGet} ? `;
        }
        switch (getTsType(field)) {
            case 'bigint': {
                baseParameter += `BigInt(${scalarGet} as number)`;
                break;
            }
            case 'number':
            case 'boolean':
            case 'string': {
                baseParameter += `${scalarGet} as ${getTsType(field)}`;
                break;
            }
            default:
                baseParameter += 'undefined';
                break;
        }
        if (optional) {
            baseParameter += ` : undefined`;
        }
    }

    return baseParameter + ';';
}
