import { capitalize, getTsType } from "src/tools/tools";
import type { DescField } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import type { GeneratedFile } from "@bufbuild/protoplugin"
import { getDefaultGetParameter } from "./getDefaultGetParameter";
import { getNodeParameter } from "src/tools/getNodeParameter";

export function generateActionGetParameterRecursive(destinationFile: GeneratedFile, field: DescField, iteration: number, oneofField: boolean = false, isList: boolean = false, optional: string = ''): void {
	const idt = '    '.repeat(iteration);
	const indented = iteration !== 0;
	const item = indented ? `item${field.parent.name}: IDataObject` : 'index: number';

    if (!optional) {
        optional = field.proto.proto3Optional ? ' | undefined' : '';
    }
    if (field.fieldKind === 'list' && !isList) {
        // f.print`// LIST`;
        destinationFile.print`${idt}    function get${capitalize(field.localName)}(this: IExecuteFunctions, ${item}): ${getTsType(field)}[]${optional} {`;
        generateActionGetParameterRecursive(destinationFile, field, iteration + 1, oneofField, true);
        destinationFile.print`${idt}        const ${field.jsonName}CollectionParent: IDataObject | undefined = ${getNodeParameter(field.jsonName + 'List', indented, field.parent.name)} as IDataObject | undefined;
${idt}        if (${field.jsonName}CollectionParent === undefined) {
${idt}            return [];
${idt}        }
${idt}        const ${field.jsonName}Collection: IDataObject[] | undefined = ${field.jsonName}CollectionParent['collection'] as IDataObject[] | undefined;
${idt}        if (${field.jsonName}Collection === undefined) {
${idt}            return [];
${idt}        }
${idt}        const ${field.jsonName}List: ${getTsType(field)}[] = [];
${idt}        for (const item${capitalize(field.localName)} of ${field.jsonName}Collection) {
${idt}            ${getDefaultGetParameter({ field: field, itemName: `item${capitalize(field.localName)}`, isList: true, indented: true })}
${idt}            ${field.jsonName}List.push(${field.jsonName});
${idt}        }
${idt}        return ${field.jsonName}List;
${idt}    }`;
    }
    else if (field.oneof && !oneofField) {
        // f.print`// ONEOF`;
        destinationFile.print`${idt}    type ${field.oneof.localName}Type =
${idt}        { value?: undefined, case: undefined } |
${field.oneof.fields.map((f) => `${idt}        { value: ${getTsType(f)}, case: "${f.jsonName}" }`).join(' |\n')};
${idt}    function get${capitalize(field.oneof.localName)}(this: IExecuteFunctions, ${item}): ${field.oneof.localName}Type {
${idt}        const selectedCase: string | undefined = ${getNodeParameter(field.oneof.localName + 'Select', indented, field.parent.name)} as string | undefined;
${idt}        if (selectedCase === undefined) {
${idt}            return { case: undefined };
${idt}        }`;
        for (const oneofField of field.oneof.fields) {
            generateActionGetParameterRecursive(destinationFile, oneofField, iteration + 1, true, false);
        }
        destinationFile.print`${field.oneof.fields.map((oneofField) => `
${idt}        if (selectedCase === "${oneofField.jsonName}") {
${idt}            ${getDefaultGetParameter({ field: oneofField, itemName: `item${capitalize(field.parent.name)}`, isOneofField: true, indented: true })}
${idt}            return { value: ${oneofField.jsonName}, case: "${oneofField.jsonName}" };
${idt}        }`).join('')}
${idt}        return { case: undefined };
${idt}    }`;
    }
    else if (field.enum) {
        // f.print`// ENUM`;
        destinationFile.print`${idt}    function get${capitalize(field.localName)}(this: IExecuteFunctions, ${item}): ${getTsType(field)}${optional} {
${idt}        const value: string | number${optional} = ${getNodeParameter(field.jsonName, indented, field.parent.name)} as string | number${optional};
${optional ? `${idt}        if (value === undefined) {
${idt}            return undefined;
${idt}        }` : ''}
${idt}        if (typeof value == 'number') {
${idt}            if (${getTsType(field)} [value] === undefined) {
${idt}                throw new Error('The attachment type "\${value}" is not known.');
${idt}            }
${idt}            return value as ${getTsType(field)};
${idt}        }
${idt}        else {
${idt}            const enumKey = value.replace("${field.jsonName.toUpperCase()}_", "");
${idt}            return ${getTsType(field)} [enumKey as keyof typeof ${getTsType(field)}];
${idt}        }
${idt}    }`;
    }
	else if (field.message) {
        // f.print`// MESSAGE`;
        destinationFile.print`${idt}    function get${capitalize(field.localName)}(this: IExecuteFunctions, ${item}): ${getTsType(field)}${optional} {
${idt}        const item${capitalize(field.localName)} = ${getNodeParameter(field.jsonName, indented, field.parent.name)} as IDataObject${optional};`;
        if (optional) {
            destinationFile.print`${idt}        if (item${capitalize(field.localName)} === undefined) {
${idt}            return undefined;
${idt}        }`;
        }
        const oneofNames: string[] = [];
        for (const subField of field.message.fields) {
            if (subField.oneof) {
                if (oneofNames.includes(subField.oneof.localName)) {
                    continue;
                }
                oneofNames.push(subField.oneof.localName);
            }
            generateActionGetParameterRecursive(destinationFile, subField, iteration + 1, false, false, optional);
            destinationFile.print`${idt}        ${getDefaultGetParameter({ field: subField, itemName: `item${capitalize(field.localName)}`, indented: true, optional })}`;
        }

        destinationFile.print`${idt}        return new ${getTsType(field)}({`;
        for (const subField of field.message.fields) {
            if (subField.oneof === undefined) {
				destinationFile.print`${idt}            ${subField.jsonName},`;
            }
        }
        for (const oneofName of oneofNames) {
            destinationFile.print`${idt}            ${oneofName},`;
        }
        destinationFile.print`${idt}        });`;
        destinationFile.print`${idt}    }`;
    }
}
