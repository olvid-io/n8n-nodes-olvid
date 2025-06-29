import { OlvidClient } from "../client/OlvidClient";
import * as datatypes from '../protobuf/olvid/daemon/datatypes/v1/datatypes';

import { ILoadOptionsFunctions, INodeListSearchResult } from "n8n-workflow";

export async function discussionSearch(
    this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
    const credentials = await this.getCredentials('olvidApi') as { clientKey: string, daemonEndpoint: string };
    const client = new OlvidClient(
        credentials.daemonEndpoint,
        credentials.clientKey,
    );
    const discussions: datatypes.Discussion[] = [];
    for await (const discussion of client.discussionList())
        discussions.push(discussion);

    return {
        results: discussions.map((discussion) => ({
            name: discussion.title,
            value: discussion.id.toString(),
        })),
    };
}
