import type { DescField, DescMessage } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import {ScalarType} from "@bufbuild/protobuf";

/*
* this function generate the code that will convert a protobuf message to a n8n compatible json.
* output code will depend on original message definition (number and type of its fields).
 */
export function generateFunctionReturnObjectFromProtobufMessage(message: DescMessage, prefix: string): string {
	if (message.fields.length == 0) {
		return "{}";
	}
	let fieldsAsString: string[] = [];
	if (message.fields.length == 1) {
		let field = message.fields[0];
		if (field.fieldKind === "message" || field.fieldKind === "list") {
			fieldsAsString.push(recursivelyGenerateCodeForField(field, prefix, 0, true));
		}
		else {
			fieldsAsString.push("{" + recursivelyGenerateCodeForField(field, prefix, 0, false) + "}");
		}
	}
	else {
		for (let field of message.fields) {
			fieldsAsString.push("{" + recursivelyGenerateCodeForField(field, prefix, 0, false) + "}");
		}
	}
	return (message.fields.length != 1 ? '[' : '') + fieldsAsString.join(",") + (message.fields.length != 1 ? ']' : '');
}

function recursivelyGenerateCodeForField(field: DescField, accessFieldPrefix: string, indentCount: number, hide_field_name: boolean = false): string {
	// const indentString: string = indentCount >= 0 ? "  ".repeat(indentCount + 3) : "";
	const indentString = "";
	let suffix: string = 0 <= indentCount && indentCount <= 2 ? "\n": "";
	const addFieldName: string = hide_field_name ? "" : field.jsonName + ": ";

	// oneof
	if (field.oneof !== undefined) {
		return indentString + addFieldName + accessFieldPrefix + field.oneof.name + ".case === '" + field.jsonName + "' ? " + castFieldIfNecessary(accessFieldPrefix + field.oneof.name + ".value", field) + " : undefined" + suffix;
	}
	// repeated
	else if (field.fieldKind == "list") {
		// repeated message
		if (field.message !== undefined) {
			return indentString + addFieldName + accessFieldPrefix + field.jsonName + ".map(e => ({" + field.message.fields.map(f => recursivelyGenerateCodeForField(f, "e.", -1)).join(", ") + "}))" + suffix;
		}
		else {
			throw new Error(`#--# GENERATION ERROR: generateField: unsupported repeated field kind: ${field.fieldKind}, you must extend generation code\n${field.parent}"`);
		}
	}
	// enum
	else if (field.enum !== undefined) {
		return indentString + addFieldName + castFieldIfNecessary(accessFieldPrefix + field.jsonName, field) + suffix;
	}
	// scalar
	else if (field.scalar !== undefined) {
		return indentString + addFieldName + castFieldIfNecessary(accessFieldPrefix + field.jsonName, field) + suffix;
	}
	// message
	else if (field.message !== undefined) {
		return indentString + addFieldName + "{" + field.message.fields.map(f => recursivelyGenerateCodeForField(f, accessFieldPrefix + field.jsonName + "?.", indentCount + 1).trimEnd()).join(", ") + indentString + "}";
	}
	else {
		// @ts-ignore
		throw new Error(`#--# GENERATION ERROR: generateField: unsupported field kind: ${field.fieldKind}, you must extend generation code\n${field.parent}"`);
	}
}

function castFieldIfNecessary(accessFieldString: string, field: DescField) {
	// cast BigInt to number
	if (field.scalar !== undefined && [ScalarType.INT64, ScalarType.SINT64, ScalarType.FIXED64, ScalarType.SFIXED64, ScalarType.UINT64, ].includes(field.scalar)) {
		return "Number(" + accessFieldString +")"
	}
	else if (field.enum) {
		// example of field.enum.typeName value: olvid.daemon.datatypes.v1.Group.AdvancedConfiguration.RemoteDelete
		const enumModuleName: string = field.enum.typeName.replace("olvid.daemon.", "").replace(".v1", "").split(".")[0]; // extract module (datatypes, command, ...)
		const enumClassName: string = field.enum.typeName.split(".v1.")[1].replace(/\./gi, "_");
		const enumFullClassPath: string = enumModuleName + "." + enumClassName ;
		return `${enumFullClassPath}[${accessFieldString} ?? 0]`
	}
	return accessFieldString;
}
