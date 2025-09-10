import type { GeneratedFile } from '@bufbuild/protoplugin';
import { capitalize, getTriggerPropertiesName, getTriggerUpdateName } from '../tools/tools';
import { getDefaultPropertyJson, getDefaultType } from '../tools/getDefaultPropertyJson';
//@ts-ignore
import type { DescMethod, DescField, DescOneof } from '@bufbuild/protobuf';

function generateMessageCollection(f: GeneratedFile, method: DescMethod, field: DescField, indentation: number, parents: string = ''): void {
	const idt = '  '.repeat(indentation);

	f.print`${idt}  {
${idt}    displayName: '${parents.trim()}',
${idt}    name: '${field.jsonName}',
${idt}    type: 'collection',
${idt}    default: {
${(field.proto.proto3Optional ? [] : [
		field.message?.oneofs?.length
			? field.message.oneofs.map((oneof: DescOneof) => `${idt}      ${oneof.localName}Select: 'undefined',\n`).join('')
			: '',
		field.message?.fields
			.map((subField: DescField) => subField.proto.proto3Optional ? '' : `${idt}      ${subField.jsonName}: ${getDefaultType(subField)},\n`)
			.join('')
	]).filter(Boolean).join('')}${idt}    },
${idt}    options: [`;
}

function generateTriggerPropertiesJsonRecursive(destinationFile: GeneratedFile, method: DescMethod, field: DescField, indentation: number, parents: string = '', oneofNames: string[], stopOneof: boolean = false, stopList: boolean = false): void {
	const idt = '  '.repeat(indentation);

	if (field.fieldKind === 'list' && !stopList) {
		destinationFile.print`${idt}  {
${idt}    displayName: '${parents}- List',
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
		generateTriggerPropertiesJsonRecursive(destinationFile, method, field, indentation + 4, parents, oneofNames, true, true);
		destinationFile.print`${idt}        ],
${idt}      },
${idt}    ],
${idt}  },`;
		return;
	}
	else if (field.oneof && !stopOneof) {
		destinationFile.print`${idt}  {
${idt}    displayName: '${parents.trim()}',
${idt}    name: '${field.oneof.localName}Select',
${idt}    type: 'options',
${idt}    options: [
${idt}      { name: 'Select', value: 'undefined' },
${field.oneof.fields.map((value: DescField) => `${idt}      { name: '${value.jsonName}', value: '${value.jsonName}' },`).join('\n')}
${idt}    ],
${idt}    default: 'undefined',
${idt}  },`;
		for (const oneofField of field.oneof.fields) {
			generateTriggerPropertiesJsonRecursive(destinationFile, method, oneofField, indentation, parents + ' - ' + capitalize(oneofField.jsonName), oneofNames, true);
		}
	}
	else if (field.message) {
		generateMessageCollection(destinationFile, method, field, indentation, parents);
		for (const subField of field.message.fields) {
			if (subField.oneof) {
				if (oneofNames.includes(subField.oneof.localName)) {
					continue;
				}
				oneofNames.push(subField.oneof.localName);
			}
			generateTriggerPropertiesJsonRecursive(destinationFile, method, subField, indentation + 2, parents + '| ' + capitalize(subField.jsonName), oneofNames);
		}
		destinationFile.print`${idt}    ],
${idt}  },`;
	} else {
			destinationFile.print`  ${getDefaultPropertyJson(field, indentation, parents)}`;
	}
}

export function generateTriggerPropertiesJson(destinationFIle: GeneratedFile, method: DescMethod): void {
	destinationFIle.print`
const properties: INodeProperties[] = [`;
	if (method.methodKind === 'client_streaming' || method.methodKind === "bidi_streaming") {
		throw new Error(`#--# GENERATION ERROR: generateActionPropertiesJson: Client streaming and bidirectional streaming not supported: "${method.parent.name}"`);
	}

	for (const subField of method.input.fields) {
		const oneofNames: string[] = [];
		generateTriggerPropertiesJsonRecursive(destinationFIle, method, subField, 0, capitalize(subField.localName) + ' ', oneofNames);
	}
	destinationFIle.print`];

const displayOptions = {
  show: {
    updates: ['${getTriggerUpdateName(method)}'],
  },
};

export const ${getTriggerPropertiesName(method)} = updateDisplayOptions(displayOptions, properties);`;
}
