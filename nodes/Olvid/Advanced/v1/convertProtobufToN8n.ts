import { DescField, DescMessage, Message } from '@bufbuild/protobuf';
import { IDataObject, INodeExecutionData } from 'n8n-workflow';
import { decapitalize } from '../../../../generation/src/nodes/tools/stringUtils';
import {base64Encode} from "@bufbuild/protobuf/wire";

export function buildResponseMessage(originalMessage: Message|any, messageDesc: DescMessage, returnJsonArray: (jsonData: IDataObject | IDataObject[]) => INodeExecutionData[]): INodeExecutionData[] {
	const dataObject: IDataObject = {};
	for (const field of messageDesc.fields) {
		Object.assign(dataObject, recursivelyBuildResponseMessage(originalMessage, field));
	}
	return returnJsonArray(dataObject);
}

// specific case for list commands
export function buildListResponseMessage(originalMessage: Message, messageDesc: DescMessage, returnJsonArray: (jsonData: IDataObject | IDataObject[]) => INodeExecutionData[]): INodeExecutionData[] {
	const originalExecutionData: INodeExecutionData[] = buildResponseMessage(originalMessage, messageDesc, returnJsonArray);
	const originalDataObject: IDataObject = originalExecutionData[0].json;
	const newDataObject: IDataObject[] = [];
	messageDesc.fields.forEach((field) => {
		if (field.fieldKind === "list") {
			// try to automatically determine key to use: use datatype if a message or remove the trailing "s" else. (THIS IS NOT ROBUST AT ALL)
			if (!field.message && !field.localName.endsWith("s")) {
				console.warn(`buildListResponseMessage: ${messageDesc}.${field.localName}: name is not valid and you might extend generation code`)
			}
			(originalDataObject[field.localName] as IDataObject[]).forEach((e: IDataObject) => {
				const newKey = field.message ? decapitalize(field.message.typeName.split(".")[field.message.typeName.split(".").length - 1]) : field.localName.substring(0, field.localName.length - 1);
				const newElement: IDataObject = {}
				newElement[newKey] = e;
				newDataObject.push(newElement);
			});
		}
		// specific case for list with more than one repeated field (currently there is only KeycloakUserList)
		else {
			const newElement: IDataObject = {}
			newElement[field.localName] = originalDataObject[field.localName];
			newDataObject.push(newElement);
		}
	});
	return returnJsonArray(newDataObject);
}

function recursivelyBuildResponseMessage(originalMessage: any, field: DescField, ignoreOneOf: boolean = false, ignoreList: boolean = false): IDataObject {
	const dataObject: IDataObject = {};

	if (field.oneof && !ignoreOneOf) {
		if (originalMessage[field.oneof.localName] && originalMessage[field.oneof.localName]["case"] === field.localName) {
			// This is a hack we build a fake message with only this field to re-use the recursive function and properly generate
			// response even if the one of case is a message or a complex structure
			let fakeOriginalMessage: IDataObject = {}
			fakeOriginalMessage[field.localName] = originalMessage[field.oneof.localName]["value"];
			Object.assign(dataObject, recursivelyBuildResponseMessage(fakeOriginalMessage, field, true))
		}
	}
	else if (field.fieldKind === "list" && !ignoreList) {
		if (originalMessage[field.localName]) {
			const elementList: IDataObject[] = [];
			// This is also a hack, create a fake original message to pass to recursive call
			originalMessage[field.localName].forEach((e: any) => {
				const fakeOriginalMessage: IDataObject = {};
				fakeOriginalMessage[field.localName] = e;
				elementList.push(recursivelyBuildResponseMessage(fakeOriginalMessage, field, false, true))
			});
			dataObject[field.localName] = elementList.map((e: IDataObject) => { return e[field.localName] });
		}
	}
	else if (field.message) {
		if (originalMessage[field.localName]) {
			const subDataObject: IDataObject = {};
			field.message.fields.forEach((subField) => {Object.assign(subDataObject, recursivelyBuildResponseMessage(originalMessage[field.localName], subField))})
			dataObject[field.localName] = subDataObject;
		}
	}
	// handle bytes fields
	else if (field.scalar) {
		switch (ScalarProto_TypeJson[field.scalar]) {
      case 'number': {
				dataObject[field.localName] = Number(originalMessage[field.localName]);
				break;
			}
			case 'boolean': {
				dataObject[field.localName] = originalMessage[field.localName] as boolean;
				break;
			}
			case 'string': {
				dataObject[field.localName] = originalMessage[field.localName] as string;
				break;
			}
			case 'bytes': {
				dataObject[field.localName] = base64Encode(originalMessage[field.localName]).toString();
				break;
			}
			default: {
				throw new Error(`${field.parent.name}.${field.localName}: ${field.scalar}: is not a valid/supported type`);
			}
    }
	}
	else if (field.enum) {
		dataObject[field.localName] = originalMessage[field.localName];
	}
	return dataObject;
}

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
	12: "bytes",			// BYTES
	13: "number",     // UINT32
	15: "number",     // SFIXED32
	16: "number",     // SFIXED64
	17: "number",     // SINT32 (uses ZigZag encoding, still fits in `number`)
	18: "number",     // SINT64 (uses ZigZag encoding, needs `bigint`)
} as const;
