import { datatypes, OlvidClient } from "@olvid/bot-node";
import { ILoadOptionsFunctions, INodeListSearchResult } from "n8n-workflow";

export async function discussionSearch(
    this: ILoadOptionsFunctions,
): Promise<INodeListSearchResult> {
    const credentials = await this.getCredentials('olvidApi') as { clientKey: string, daemonEndpoint: string };
    const client = new OlvidClient({
        serverUrl: credentials.daemonEndpoint,
        clientKey: credentials.clientKey,
    });
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
