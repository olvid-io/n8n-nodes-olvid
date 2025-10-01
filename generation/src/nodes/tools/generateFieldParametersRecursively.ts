import {
	capitalize,
	getOneofFieldOptionName,
	getOneofFieldSelectorDisplayName,
	getOneofFieldSelectorName,
} from './stringUtils';
import { type INodeProperties, type NodeParameterValueType } from 'n8n-workflow';
import type { DescEnumValue, DescField } from '@bufbuild/protobuf';
import { ScalarProto_TypeJson } from './types';

// required: we pass value to first call, then recursive call pass undefined to ignore this field
// stopList: we first create the collecton for the list argument then we recursivaly build collection with stopList set to true to consider the field and not the list
// stopOneOf: same as stopList but for oneOf
export function generateFieldParametersRecursively(field: DescField, alreadyTreatedOneof: string[], required: boolean|undefined = undefined, stopList: boolean = false, stopOneOf: boolean = false,): INodeProperties[] {
	// compute display: most of the time it is the field name, but if it's a one of field we add oneof selector name to display name (try to make it easier to read)
	const displayName: string = field.oneof ? getOneofFieldOptionName(field, field.oneof) : capitalize(field.localName);

	if (field.fieldKind === 'list' && !stopList) {
		return [{
			displayName: displayName,
			name: field.jsonName,
			type: 'fixedCollection',
			typeOptions: { multipleValues: true },
			required: required,
			default: {},
			options: [{
				name: "collection",
				displayName: "Collection",
				values: generateFieldParametersRecursively(field, alreadyTreatedOneof, undefined, true, stopOneOf)
			}],
		}];
	}
	else if (field.oneof && !stopOneOf) {
		if (alreadyTreatedOneof.includes(field.oneof.toString())) {
			return [];
		}
		else {
			alreadyTreatedOneof.push(field.oneof.toString());
		}

		return [
			// create a selector to choose which case we use
			{
				// selector display name is the oneof field name because it's shared by all sub fields
				displayName: getOneofFieldSelectorDisplayName(field.oneof),
				description: `Choose one of these arguments to use (other are ignored): ${field.oneof.fields.map(f => { return `${field.oneof?.localName} | ${f.localName}`}).join(", ")}`,
				name: getOneofFieldSelectorName(field.oneof),
				type: 'options',
				required: required,
				options: [
					{ name: 'Select', value: 'undefined' },
					...field.oneof.fields.map((value: DescField) => {return { name: value.jsonName, value: value.jsonName };}),
				],
				default: 'undefined',
			},
			// generate a distinct option for each field in this oneof (selector will decide which option we will use)
			...field.oneof.fields.flatMap((f) => {return generateFieldParametersRecursively(f, alreadyTreatedOneof, undefined, stopList, true);}),
		];
	}
	else if (field.message) {
		// build message options
		let options: INodeProperties[] = [];
		for (const subField of field.message.fields) {
			if (subField.oneof) {
				if (alreadyTreatedOneof.includes(subField.oneof.localName)) {
					continue;
				}
				alreadyTreatedOneof.push(subField.oneof.localName);
			}
			options.push(...generateFieldParametersRecursively(subField, alreadyTreatedOneof, undefined, stopList, stopOneOf));
		}
		// build message default values
		let default_: NodeParameterValueType = {};
		// only set default if field is not optional
		if (!field.proto.proto3Optional) {
			// one field: add a default value for selector
			if (field.message?.oneofs.length) {
				field.message?.oneofs.forEach(
					(oneof) => (default_[`${oneof.localName}Select`] = 'undefined'),
				);
			}
			// add field default value for collection
			if (field.message?.fields) {
				field.message?.fields.forEach(
					(field) => (default_[field.jsonName] = getFieldDefaultValue(field)),
				);
			}
		}
		return [{
			displayName: displayName,
			name: field.jsonName,
			type: 'collection',
			default: default_,
			options: options,
			required: required,
		}];
	}
	else if (field.enum) {
		return [{
			displayName: displayName,
			name: field.jsonName,
			type: "options",
			options: field.enum.values.map((e: DescEnumValue) => { return {name: e.name, value: e.number}}),
			default: field.enum.values[0].number,
			required: required,
		}]
	}
	else if (field.scalar) {
		return [{
			displayName: displayName,
			name: field.jsonName,
			type: ScalarProto_TypeJson[field.scalar],
			default: getFieldDefaultValue(field),
			required: required,
		}]
	}
	else {
		// @ts-ignore
		throw new Error(`Invalid field type: ${field.parent.name}.${field.name} (${field.kind})`);
	}
}

export function getFieldDefaultValue(field: DescField): NodeParameterValueType {
	if (field.scalar) {
		if (ScalarProto_TypeJson[field.scalar] === 'boolean')
			return false;
		else if (ScalarProto_TypeJson[field.scalar] === 'number')
			return 0;
	}
	else if (field.enum) {
		return field.enum.values[0].name;
	}
	return "";
}
