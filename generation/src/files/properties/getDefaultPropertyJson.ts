import type { DescField } from "@bufbuild/protoplugin/node_modules/@bufbuild/protobuf/dist/cjs/descriptors"
import { ScalarProto_TypeJson } from "src/tools/types";

export function getDefaultType(field: DescField): string {
  if (field.scalar) {
    if (ScalarProto_TypeJson[field.scalar] == 'boolean')
      return 'false';
    if (ScalarProto_TypeJson[field.scalar] == 'number')
      return '0';
  }
  else if (field.enum) {
    return `'${field.enum.values[0].name}'`;
  }
  return "''";
}

export function getDefaultPropertyJson(field: DescField, indentation: number, parents: string = ''): string {
  const idt = '  '.repeat(indentation);
  return `${idt}{
${idt}    displayName: '${parents.trim()}',
${idt}    name: '${field.jsonName}',
${idt}    type: '${field.scalar ? ScalarProto_TypeJson[field.scalar] : field.enum ? 'options' : 'string'}',
${indentation == 0 ? `${idt}    required: ${field.proto.proto3Optional ? 'false' : 'true'},` : ''}
${field.enum ? `${idt}    options: [
${field.enum.values.map((value) => `${idt}      { name: '${value.name}', value: '${value.name}' },`).join('\n')}
${idt}    ],` : ''}
${idt}    default: ${getDefaultType(field)},
${idt}  },`;
}
