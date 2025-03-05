import type { GeneratedFile } from "node_modules/@bufbuild/protoplugin/dist/cjs";
import type { ResourceOperationListType } from "../../tools/types";

export function generateRouterCallOperation(f: GeneratedFile, resourceOperationList: ResourceOperationListType, useAdminClient: boolean = false): void {
    f.print`import type { IExecuteFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';\n`;
    for (const resource in resourceOperationList) {
        f.print`import * as ${resource} from './${resource}';`;
    }
    f.print`
import type { Olvid } from './generatedInterfaces';
import { Olvid${useAdminClient ? 'Admin' : ''}Client } from '@olvid/bot-node';

export async function callOperation(this: IExecuteFunctions, i: number, client: Olvid${useAdminClient ? 'Admin' : ''}Client, olvid: Olvid): Promise<IDataObject | IDataObject[]> {
    switch (olvid.resource) {`;
    for (const resource in resourceOperationList) {
        f.print`        case '${resource}': {
            return await ${resource}[olvid.operation].execute.call(this, i, client);
        }`;
    }
    f.print`        default: throw new Error(\`The resource is not known!\`);
    }
}`;
}
