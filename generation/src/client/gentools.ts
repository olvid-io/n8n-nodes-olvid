import type { DescField, DescMessage } from '@bufbuild/protobuf';
import { ScalarProto_Type } from '../nodes/tools/types';

// field: MessageId id = 1 => messageId: datatypes.MessageId
// field: uint64 id = 1 => id: BigInt
export function getFieldAsAParameter(field: DescField): string {
	return `${field.localName}${field.proto.proto3Optional || field.fieldKind === 'list' ? '?' : ''}: ${getFieldTsType(field)}`;
}

export function getFieldTsType(field: DescField): string {
	let prefix = field.message
		? getModulePrefixFromFileName(field.message.file.name)
		: field.enum
			? getModulePrefixFromFileName(field.enum.file.name)
			: '';
	return prefix + getProtoType(field);
}

export function getMessageTsType(message: DescMessage, addModule: boolean = false): string {
	return `${addModule ? getModulePrefixFromFileName(message.file.name) : ''}${message.name}`;
}

function getModulePrefixFromFileName(fileName: string) {
	return fileName.split('/').slice(-3, -2)[0] + '.';
}

function getProtoType(field: DescField): string {
	let type: string;
	if (field.scalar) {
		type = ScalarProto_Type[field.scalar];
	} else {
		type = field.proto.typeName.split('.').slice(5).join('_');
	}
	if (field.fieldKind === 'list') {
		return `${type}[]`;
	}
	return type;
}
