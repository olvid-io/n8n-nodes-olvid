import type { GeneratedFile } from "@bufbuild/protoplugin"
import type { ResourceOperationListType } from "../../tools/types";
import { decapitalize } from "src/tools/tools";

export function generateActionIndexes(f: GeneratedFile, resourceOperationList: ResourceOperationListType, resource: string): void {
  f.print`
import type { INodeProperties } from 'n8n-workflow';
${resourceOperationList[resource].map(operation => `import * as ${operation} from './${decapitalize(operation)}.operation';`).join('\n')}

export { ${resourceOperationList[resource].map(operation => `${operation}`).join(', ')}};

export const descriptions: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['${resource}'],
      },
    },
    // eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
    options: [
${resourceOperationList[resource].map(operation => `      {
        name: '${operation}',
        value: '${operation}',
        action: '${operation.charAt(0).toUpperCase() + operation.slice(1).replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`).trim()}',
      },`).join('\n')}
    ],
    default: '${resourceOperationList[resource][0]}',
  },
${resourceOperationList[resource].map(operation => `  ...${operation}.description,`).join('\n')}
];`;
}
