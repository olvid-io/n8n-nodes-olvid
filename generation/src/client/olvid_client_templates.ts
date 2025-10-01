export const olvidClientTemplate = `// noinspection JSUnusedGlobalSymbols

import {
    CallbackClient,
    Client,
    createCallbackClient,
    createClient,
    type Interceptor,
    Transport
} from "@connectrpc/connect";
import { create } from '@bufbuild/protobuf';
import { createGrpcTransport, type GrpcTransportOptions } from "@connectrpc/connect-node";
import * as datatypes from "../protobuf/olvid/daemon/datatypes/v1/datatypes";
import * as services from "../protobuf/olvid/daemon/services/v1/services";
import * as command from "../protobuf/olvid/daemon/command/v1/command";
import * as notification from "../protobuf/olvid/daemon/notification/v1/notification";
import EventEmitter from "events";

const ATTACHMENT_CHUNK_SIZE = 1024 * 1024; // 1MB

export class OlvidClient {

    public readonly clientKey?: string;
    public readonly serverUrl?: string;

    protected readonly transport: Transport;

    // Used to stop all the running callbacks when we stop the client
    protected callbacksAbort: AbortController;
    // Keep a set of every running callback
    protected activeCallbacks: Set<string> = new Set();
    // Emit an event when a callback ends
    protected callbackUpdate: EventEmitter = new EventEmitter();

    // Used to keep the client alive, even if no callbacks are registered
    protected lifecycleWorker?: EmptyWorker;
    // Used to stop the EmptyWorker when used runForever
    protected lifecycleAbort?: AbortController;

    public readonly stubs: {
//@CLIENT_STUB_DECLARATION@
    };

    constructor(serverUrl: string, clientKey: string) {
        this.serverUrl = serverUrl;
        this.clientKey = clientKey;

        let transportOptions: GrpcTransportOptions = {
            baseUrl: serverUrl,
            useBinaryFormat: true,
        }
				transportOptions.interceptors ?
            transportOptions.interceptors.push(this.getAuthenticationInterceptor())
            : transportOptions.interceptors = [this.getAuthenticationInterceptor()]
        this.transport = createGrpcTransport(transportOptions);

        this.stubs = {
//@CLIENT_STUB_CREATION@
        };

				// create the callback abort controller
        this.callbacksAbort = new AbortController();
		}

    protected getAuthenticationInterceptor(): Interceptor {
        return (next) => async (req) => {
            let metadata: Map<string, string> = this.getMetadata();
            metadata.forEach((value, key) => {
                req.header.set(key, value);
            })
            return await next(req);
        };
    }

    protected getMetadata(): Map<string, string> {
        const metadata = new Map();
        if (this.clientKey) {
            metadata.set("daemon-client-key", this.clientKey)
        }
        return metadata;
    }

    /**
     * Wait for all the callbacks registered in the client to end
     * Note: It doesn't stop the client, use stop() instead
     */
    public async waitForCallbacksEnd() {
        // Wait for all callbacks to stop
        return new Promise<void>((resolve) => {
            this.callbackUpdate.on("removed", () => {
                if (this.activeCallbacks.size === 0) {
                    resolve();
                }
            });
        });
    }

    /**
     * Run the client forever
     * Can be stopped using this.stop()
     */
    public async runForever() {
        this.lifecycleAbort = new AbortController();
        this.lifecycleWorker = new EmptyWorker(this.lifecycleAbort.signal);
        await this.lifecycleWorker.run();
    }

    /**
     * Stop the client and all the running callbacks
     */
    public stop() {
        this.lifecycleAbort?.abort();
        this.callbacksAbort.abort();
    }

    /*
    ** Manually implemented client side streaming methods
    */
    public async messageSendWithAttachments(request: { discussionId: bigint, attachments: {filename: string, payload: Uint8Array}[], body?: string, replyId?: datatypes.MessageId, ephemerality?: datatypes.MessageEphemerality, disableLinkPreview?: boolean}) {
        async function* requestStream(): AsyncIterable<command.MessageSendWithAttachmentsRequest> {
            // send message and files metadata
            const metadata =  create(command.MessageSendWithAttachmentsRequestMetadataSchema, {
                discussionId: request.discussionId,
                body: request.body,
                replyId: request.replyId,
                ephemerality: request.ephemerality,
                files: request.attachments.map((attachment) => {
                    return create(command.MessageSendWithAttachmentsRequestMetadata_FileSchema, {
                        filename: attachment.filename,
                        fileSize: BigInt(attachment.payload.byteLength)
                    });
                }),
                disableLinkPreview: request.disableLinkPreview,
            });
            yield create(command.MessageSendWithAttachmentsRequestSchema, {request: {case: "metadata", value: metadata}});

            // send files
            for (let attachment of request.attachments) {
                for (let chunk_index = 0; chunk_index < attachment.payload.byteLength; chunk_index += ATTACHMENT_CHUNK_SIZE) {
                    // send chunk
                    const chunk = new Uint8Array(attachment.payload.subarray(chunk_index, chunk_index + ATTACHMENT_CHUNK_SIZE));
                    yield create(command.MessageSendWithAttachmentsRequestSchema, {request: {case: "payload", value: chunk}});
                }
                // send file delimiter
                yield create(command.MessageSendWithAttachmentsRequestSchema, {request: {case: "fileDelimiter", value: true},});
            }
        }
        const response: command.MessageSendWithAttachmentsResponse = await this.stubs.messageCommandStub.messageSendWithAttachments(requestStream());
        return {message: response.message!, attachments: response.attachments!};
    }

//@CLIENT_METHODS@
}

class EmptyWorker {
    private signal: AbortSignal;

    constructor(signal: AbortSignal) {
        this.signal = signal;
    }

    public async run() {
        return new Promise((resolve) => {
            // Start new empty worker to keep the client alive
            const timeout = setInterval(() => {}, 2_147_483_647);

            this.signal.addEventListener("abort", () => {
                clearInterval(timeout);
                resolve(void 0);
            });
        });
    }
}`

export const olvidAdminClientTemplate = `import {
    Client, createClient,
} from "@connectrpc/connect";
import * as services from "../protobuf/olvid/daemon/services/v1/services";
import * as datatypes from "../protobuf/olvid/daemon/datatypes/v1/datatypes";
import * as admin from "../protobuf/olvid/daemon/admin/v1/admin";
import {OlvidClient} from "./OlvidClient";

export class OlvidAdminClient extends OlvidClient {
    public currentIdentityId: number = 0;

    public readonly adminStubs: {
//@ADMIN_CLIENT_STUB_DECLARATION@
    };

    public constructor(serverUrl: string, clientKey: string) {
        super(serverUrl, clientKey);
        this.adminStubs = {
//@ADMIN_CLIENT_STUB_CREATION@
        };
    }

    protected override getMetadata(): Map<string, string> {
        const metadata = new Map();
        if (this.clientKey) {
            metadata.set("daemon-client-key", this.clientKey);
        }
        if (this.currentIdentityId) {
            metadata.set("daemon-identity-id", this.currentIdentityId);
        }
        return metadata;
    }

//@ADMIN_CLIENT_METHODS@

}`
