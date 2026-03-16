import { DescField, DescMessage } from '@bufbuild/protobuf';
import { IDataObject, INodeExecutionData } from 'n8n-workflow';

// if in dry run fill fields with arbitrary data and do not try to retrieve parameters
export function buildDryRunMessage(
	messageDesc: DescMessage,
	returnJsonArray: (
		jsonData: IDataObject | IDataObject[],
	) => INodeExecutionData[],
): INodeExecutionData[] {
	const dataObject: IDataObject = {};
	for (const field of messageDesc.fields) {
		Object.assign(dataObject, recursivelyBuildDryRunMessage(field, {}));
	}
	return returnJsonArray(dataObject);
}

// if in dry run mode: just fill every messages fields to show an example message
function recursivelyBuildDryRunMessage(
	field: DescField,
	options: { ignoreOneOf?: boolean; ignoreList?: boolean },
): IDataObject {
	const dataObject: IDataObject = {};

	if (field.oneof && !options.ignoreOneOf) {
		Object.assign(
			dataObject,
			recursivelyBuildDryRunMessage(field, { ignoreOneOf: true }),
		);
	} else if (field.fieldKind === 'list' && !options.ignoreList) {
		dataObject[field.localName] = [
			recursivelyBuildDryRunMessage(field, { ignoreList: true }),
		].map((e: IDataObject) => {
			return e[field.localName];
		});
	} else if (field.message) {
		const subDataObject: IDataObject = {};
		field.message.fields.forEach((subField) => {
			Object.assign(subDataObject, recursivelyBuildDryRunMessage(subField, {}));
		});
		dataObject[field.localName] = subDataObject;
	}
	// handle scalar fields
	else if (field.scalar) {
		switch (ScalarProto_TypeJson[field.scalar]) {
			case 'number': {
				dataObject[field.localName] = 0;
				break;
			}
			case 'boolean': {
				dataObject[field.localName] = false;
				break;
			}
			case 'string': {
				dataObject[field.localName] = 'string';
				break;
			}
			case 'bytes': {
				dataObject[field.localName] = 'YjY0c3RyaW5nCg==';
				break;
			}
			default: {
				throw new Error(
					`${field.parent.name}.${field.localName}: ${field.scalar}: is not a valid/supported type`,
				);
			}
		}
	} else if (field.enum) {
		dataObject[field.localName] = field.enum.values[0].number;
	}
	return dataObject;
}

export const ScalarProto_TypeJson = {
	1: 'number', // DOUBLE
	2: 'number', // FLOAT
	3: 'number', // INT64
	4: 'number', // UINT64
	5: 'number', // INT32
	6: 'number', // FIXED64
	7: 'number', // FIXED32
	8: 'boolean', // BOOL
	9: 'string', // STRING
	12: 'bytes', // BYTES
	13: 'number', // UINT32
	15: 'number', // SFIXED32
	16: 'number', // SFIXED64
	17: 'number', // SINT32 (uses ZigZag encoding, still fits in `number`)
	18: 'number', // SINT64 (uses ZigZag encoding, needs `bigint`)
} as const;
