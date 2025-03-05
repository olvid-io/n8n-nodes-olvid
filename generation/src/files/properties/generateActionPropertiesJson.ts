import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { DescMethod } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import { getDefaultPropertyJson, getDefaultType } from "./getDefaultPropertyJson";
import { capitalize } from "src/tools/tools";
import type { DescField } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"

function generateMessageCollection(f: GeneratedFile, field: DescField, indentation: number, parents: string = ''): void {
    const idt = '  '.repeat(indentation);

    f.print`${idt}  {
${idt}    displayName: '${parents.trim()}',
${idt}    name: '${field.jsonName}',
${idt}    type: 'collection',
${idt}    default: {
${(field.proto.proto3Optional ? [] : [
            field.message?.oneofs?.length
                ? field.message.oneofs.map((oneof) => `${idt}      ${oneof.localName}Select: 'undefined',\n`).join('')
                : '',
            field.message?.fields
                .map((subField) => subField.proto.proto3Optional ? '' : `${idt}      ${subField.jsonName}: ${getDefaultType(subField)},\n`)
                .join('')
        ]).filter(Boolean).join('')}${idt}    },
${idt}    options: [`;
}

function generateActionPropertiesJsonRecursive(destinationFile: GeneratedFile, field: DescField, indentation: number, parents: string = '', oneofNames: string[], stopOneof: boolean = false, stopList: boolean = false): void {
    const idt = '  '.repeat(indentation);

    if (field.fieldKind === 'list' && !stopList) {
        destinationFile.print`${idt}  {
${idt}    displayName: '${parents} - List',
${idt}    name: '${field.jsonName}List',
${idt}    type: 'fixedCollection',
${idt}    typeOptions: {
${idt}      multipleValues: true,
${idt}    },
${idt}    default: {},
${idt}    options: [
${idt}      {
${idt}        name: 'collection',
${idt}        displayName: 'Collection',
${idt}        values: [`;
        generateActionPropertiesJsonRecursive(destinationFile, field, indentation + 4, parents, oneofNames, true, true);
        destinationFile.print`${idt}        ],
${idt}      },
${idt}    ],
${idt}  },`;
        return;
    }
    if (field.oneof && !stopOneof) {
        destinationFile.print`${idt}  {
${idt}    displayName: '${parents.trim()}',
${idt}    name: '${field.oneof.localName}Select',
${idt}    type: 'options',
${idt}    options: [
${idt}      { name: 'Select', value: 'undefined' },
${field.oneof.fields.map((value) => `${idt}      { name: '${value.jsonName}', value: '${value.jsonName}' },`).join('\n')}
${idt}    ],
${idt}    default: 'undefined',
${idt}  },`;
        for (const oneofField of field.oneof.fields) {
            generateActionPropertiesJsonRecursive(destinationFile, oneofField, indentation, parents + ' - ' + capitalize(oneofField.jsonName), oneofNames, true);
        }
    }
    else if (field.message) {
        generateMessageCollection(destinationFile, field, indentation, parents);
        for (const subField of field.message.fields) {
            if (subField.oneof) {
                if (oneofNames.includes(subField.oneof.localName)) {
                    continue;
                }
                oneofNames.push(subField.oneof.localName);
            }
            generateActionPropertiesJsonRecursive(destinationFile, subField, indentation + 2, parents + '| ' + capitalize(subField.jsonName), oneofNames);
        }
        destinationFile.print`${idt}    ],
${idt}  },`;
    } else {
        destinationFile.print`  ${getDefaultPropertyJson(field, indentation, parents)}`;
    }
}

export function generateActionPropertiesJson(destinationFIle: GeneratedFile, method: DescMethod): void {
    destinationFIle.print`
const properties: INodeProperties[] = [`;
    if (method.methodKind === 'client_streaming' || method.methodKind === "bidi_streaming") {
		throw new Error(`#--# GENERATION ERROR: generateActionPropertiesJson: Client streaming and bidirectional streaming not supported: "${method.parent.name}"`);
	}

	for (const subField of method.input.fields) {
		const oneofNames: string[] = [];
		generateActionPropertiesJsonRecursive(destinationFIle, subField, 0, capitalize(subField.localName) + ' ', oneofNames);
	}
    destinationFIle.print`];

const displayOptions = {
  show: {
    resource: ['${method.parent.name}'],
    operation: ['${method.name}'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);`;
}
