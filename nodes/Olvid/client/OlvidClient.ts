// noinspection JSUnusedGlobalSymbols

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
        toolCommandStub: Client<typeof services.ToolCommandService>;
        identityCommandStub: Client<typeof services.IdentityCommandService>;
        invitationCommandStub: Client<typeof services.InvitationCommandService>;
        contactCommandStub: Client<typeof services.ContactCommandService>;
        keycloakCommandStub: Client<typeof services.KeycloakCommandService>;
        groupCommandStub: Client<typeof services.GroupCommandService>;
        discussionCommandStub: Client<typeof services.DiscussionCommandService>;
        messageCommandStub: Client<typeof services.MessageCommandService>;
        attachmentCommandStub: Client<typeof services.AttachmentCommandService>;
        storageCommandStub: Client<typeof services.StorageCommandService>;
        discussionStorageCommandStub: Client<typeof services.DiscussionStorageCommandService>;
        callCommandStub: Client<typeof services.CallCommandService>;
        settingsCommandStub: Client<typeof services.SettingsCommandService>;
        invitationNotificationStub: CallbackClient<typeof services.InvitationNotificationService>;
        contactNotificationStub: CallbackClient<typeof services.ContactNotificationService>;
        groupNotificationStub: CallbackClient<typeof services.GroupNotificationService>;
        discussionNotificationStub: CallbackClient<typeof services.DiscussionNotificationService>;
        messageNotificationStub: CallbackClient<typeof services.MessageNotificationService>;
        attachmentNotificationStub: CallbackClient<typeof services.AttachmentNotificationService>;
        callNotificationStub: CallbackClient<typeof services.CallNotificationService>;

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
            toolCommandStub: createClient(services.ToolCommandService, this.transport),
            identityCommandStub: createClient(services.IdentityCommandService, this.transport),
            invitationCommandStub: createClient(services.InvitationCommandService, this.transport),
            contactCommandStub: createClient(services.ContactCommandService, this.transport),
            keycloakCommandStub: createClient(services.KeycloakCommandService, this.transport),
            groupCommandStub: createClient(services.GroupCommandService, this.transport),
            discussionCommandStub: createClient(services.DiscussionCommandService, this.transport),
            messageCommandStub: createClient(services.MessageCommandService, this.transport),
            attachmentCommandStub: createClient(services.AttachmentCommandService, this.transport),
            storageCommandStub: createClient(services.StorageCommandService, this.transport),
            discussionStorageCommandStub: createClient(services.DiscussionStorageCommandService, this.transport),
            callCommandStub: createClient(services.CallCommandService, this.transport),
            settingsCommandStub: createClient(services.SettingsCommandService, this.transport),
            invitationNotificationStub: createCallbackClient(services.InvitationNotificationService, this.transport),
            contactNotificationStub: createCallbackClient(services.ContactNotificationService, this.transport),
            groupNotificationStub: createCallbackClient(services.GroupNotificationService, this.transport),
            discussionNotificationStub: createCallbackClient(services.DiscussionNotificationService, this.transport),
            messageNotificationStub: createCallbackClient(services.MessageNotificationService, this.transport),
            attachmentNotificationStub: createCallbackClient(services.AttachmentNotificationService, this.transport),
            callNotificationStub: createCallbackClient(services.CallNotificationService, this.transport),

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

    /*
    ** ToolCommandService
    */
   async ping(request: {} = {}): Promise<void> {
        await this.stubs.toolCommandStub.ping(request)
    }

   async daemonVersion(request: {} = {}): Promise<string> {
        let response: command.DaemonVersionResponse = await this.stubs.toolCommandStub.daemonVersion(request)
        return response.version!
    }

   async authenticationTest(request: {} = {}): Promise<void> {
        await this.stubs.toolCommandStub.authenticationTest(request)
    }

   async authenticationAdminTest(request: {} = {}): Promise<void> {
        await this.stubs.toolCommandStub.authenticationAdminTest(request)
    }

    /*
    ** IdentityCommandService
    */
   async identityGet(request: {} = {}): Promise<datatypes.Identity> {
        let response: command.IdentityGetResponse = await this.stubs.identityCommandStub.identityGet(request)
        return response.identity!
    }

   async identityGetBytesIdentifier(request: {} = {}): Promise<Uint8Array> {
        let response: command.IdentityGetBytesIdentifierResponse = await this.stubs.identityCommandStub.identityGetBytesIdentifier(request)
        return response.identifier!
    }

   async identityGetInvitationLink(request: {} = {}): Promise<string> {
        let response: command.IdentityGetInvitationLinkResponse = await this.stubs.identityCommandStub.identityGetInvitationLink(request)
        return response.invitationLink!
    }

   async identityUpdateDetails(request: {newDetails: datatypes.IdentityDetails}): Promise<void> {
        await this.stubs.identityCommandStub.identityUpdateDetails(request)
    }

   async identityRemovePhoto(request: {} = {}): Promise<void> {
        await this.stubs.identityCommandStub.identityRemovePhoto(request)
    }

	// IdentitySetPhoto: cannot generate code for client and bidirectional streaming

   async identityDownloadPhoto(request: {} = {}): Promise<Uint8Array> {
        let response: command.IdentityDownloadPhotoResponse = await this.stubs.identityCommandStub.identityDownloadPhoto(request)
        return response.photo!
    }

   async identityGetApiKeyStatus(request: {} = {}): Promise<datatypes.Identity_ApiKey> {
        let response: command.IdentityGetApiKeyStatusResponse = await this.stubs.identityCommandStub.identityGetApiKeyStatus(request)
        return response.apiKey!
    }

   async identitySetApiKey(request: {apiKey: string}): Promise<datatypes.Identity_ApiKey> {
        let response: command.IdentitySetApiKeyResponse = await this.stubs.identityCommandStub.identitySetApiKey(request)
        return response.apiKey!
    }

   async identitySetConfigurationLink(request: {configurationLink: string}): Promise<datatypes.Identity_ApiKey> {
        let response: command.IdentitySetConfigurationLinkResponse = await this.stubs.identityCommandStub.identitySetConfigurationLink(request)
        return response.apiKey!
    }

    /*
    ** InvitationCommandService
    */
   invitationList(request: {filter?: datatypes.InvitationFilter} = {}): AsyncIterable<datatypes.Invitation> {
        async function *list(invitationCommandStub: Client<typeof services.InvitationCommandService>): AsyncIterable<datatypes.Invitation> {
            for await (const response of invitationCommandStub.invitationList(request)) {
                for (const element of response.invitations) {
                    yield element;
                }
            }
        }
        return list(this.stubs.invitationCommandStub);
    }

   async invitationGet(request: {invitationId: bigint}): Promise<datatypes.Invitation> {
        let response: command.InvitationGetResponse = await this.stubs.invitationCommandStub.invitationGet(request)
        return response.invitation!
    }

   async invitationNew(request: {invitationUrl: string}): Promise<datatypes.Invitation> {
        let response: command.InvitationNewResponse = await this.stubs.invitationCommandStub.invitationNew(request)
        return response.invitation!
    }

   async invitationAccept(request: {invitationId: bigint}): Promise<void> {
        await this.stubs.invitationCommandStub.invitationAccept(request)
    }

   async invitationDecline(request: {invitationId: bigint}): Promise<void> {
        await this.stubs.invitationCommandStub.invitationDecline(request)
    }

   async invitationSas(request: {invitationId: bigint, sas: string}): Promise<void> {
        await this.stubs.invitationCommandStub.invitationSas(request)
    }

   async invitationDelete(request: {invitationId: bigint}): Promise<void> {
        await this.stubs.invitationCommandStub.invitationDelete(request)
    }

    /*
    ** ContactCommandService
    */
   contactList(request: {filter?: datatypes.ContactFilter} = {}): AsyncIterable<datatypes.Contact> {
        async function *list(contactCommandStub: Client<typeof services.ContactCommandService>): AsyncIterable<datatypes.Contact> {
            for await (const response of contactCommandStub.contactList(request)) {
                for (const element of response.contacts) {
                    yield element;
                }
            }
        }
        return list(this.stubs.contactCommandStub);
    }

   async contactGet(request: {contactId: bigint}): Promise<datatypes.Contact> {
        let response: command.ContactGetResponse = await this.stubs.contactCommandStub.contactGet(request)
        return response.contact!
    }

   async contactGetBytesIdentifier(request: {contactId: bigint}): Promise<Uint8Array> {
        let response: command.ContactGetBytesIdentifierResponse = await this.stubs.contactCommandStub.contactGetBytesIdentifier(request)
        return response.identifier!
    }

   async contactGetInvitationLink(request: {contactId: bigint}): Promise<string> {
        let response: command.ContactGetInvitationLinkResponse = await this.stubs.contactCommandStub.contactGetInvitationLink(request)
        return response.invitationLink!
    }

   async contactDelete(request: {contactId: bigint}): Promise<void> {
        await this.stubs.contactCommandStub.contactDelete(request)
    }

   async contactIntroduction(request: {firstContactId: bigint, secondContactId: bigint}): Promise<void> {
        await this.stubs.contactCommandStub.contactIntroduction(request)
    }

   async contactDownloadPhoto(request: {contactId: bigint}): Promise<Uint8Array> {
        let response: command.ContactDownloadPhotoResponse = await this.stubs.contactCommandStub.contactDownloadPhoto(request)
        return response.photo!
    }

   async contactRecreateChannels(request: {contactId: bigint}): Promise<void> {
        await this.stubs.contactCommandStub.contactRecreateChannels(request)
    }

   async contactInviteToOneToOneDiscussion(request: {contactId: bigint}): Promise<datatypes.Invitation> {
        let response: command.ContactInviteToOneToOneDiscussionResponse = await this.stubs.contactCommandStub.contactInviteToOneToOneDiscussion(request)
        return response.invitation!
    }

   async contactDowngradeOneToOneDiscussion(request: {contactId: bigint}): Promise<void> {
        await this.stubs.contactCommandStub.contactDowngradeOneToOneDiscussion(request)
    }

    /*
    ** KeycloakCommandService
    */
   async keycloakBindIdentity(request: {configurationLink: string}): Promise<void> {
        await this.stubs.keycloakCommandStub.keycloakBindIdentity(request)
    }

   async keycloakUnbindIdentity(request: {} = {}): Promise<void> {
        await this.stubs.keycloakCommandStub.keycloakUnbindIdentity(request)
    }

    keycloakUserList(request: {filter?: datatypes.KeycloakUserFilter, lastListTimestamp?: bigint} = {}): AsyncIterable<command.KeycloakUserListResponse> {
        async function *list(keycloakCommandStub: Client<typeof services.KeycloakCommandService>): AsyncIterable<command.KeycloakUserListResponse> {
            for await (const response of keycloakCommandStub.keycloakUserList(request)) {
                yield response
            }
        }
        return list(this.stubs.keycloakCommandStub)
    }

   async keycloakAddUserAsContact(request: {keycloakId: string}): Promise<void> {
        await this.stubs.keycloakCommandStub.keycloakAddUserAsContact(request)
    }

    /*
    ** GroupCommandService
    */
   groupList(request: {filter?: datatypes.GroupFilter} = {}): AsyncIterable<datatypes.Group> {
        async function *list(groupCommandStub: Client<typeof services.GroupCommandService>): AsyncIterable<datatypes.Group> {
            for await (const response of groupCommandStub.groupList(request)) {
                for (const element of response.groups) {
                    yield element;
                }
            }
        }
        return list(this.stubs.groupCommandStub);
    }

   async groupGet(request: {groupId: bigint}): Promise<datatypes.Group> {
        let response: command.GroupGetResponse = await this.stubs.groupCommandStub.groupGet(request)
        return response.group!
    }

   async groupGetBytesIdentifier(request: {groupId: bigint}): Promise<Uint8Array> {
        let response: command.GroupGetBytesIdentifierResponse = await this.stubs.groupCommandStub.groupGetBytesIdentifier(request)
        return response.identifier!
    }

   async groupNewStandardGroup(request: {name?: string, description?: string, adminContactIds?: bigint[]}): Promise<datatypes.Group> {
        let response: command.GroupNewStandardGroupResponse = await this.stubs.groupCommandStub.groupNewStandardGroup(request)
        return response.group!
    }

   async groupNewControlledGroup(request: {name?: string, description?: string, adminContactIds?: bigint[], contactIds?: bigint[]}): Promise<datatypes.Group> {
        let response: command.GroupNewControlledGroupResponse = await this.stubs.groupCommandStub.groupNewControlledGroup(request)
        return response.group!
    }

   async groupNewReadOnlyGroup(request: {name?: string, description?: string, adminContactIds?: bigint[], contactIds?: bigint[]}): Promise<datatypes.Group> {
        let response: command.GroupNewReadOnlyGroupResponse = await this.stubs.groupCommandStub.groupNewReadOnlyGroup(request)
        return response.group!
    }

   async groupNewAdvancedGroup(request: {name?: string, description?: string, advancedConfiguration?: datatypes.Group_AdvancedConfiguration, members?: datatypes.GroupMember[]}): Promise<datatypes.Group> {
        let response: command.GroupNewAdvancedGroupResponse = await this.stubs.groupCommandStub.groupNewAdvancedGroup(request)
        return response.group!
    }

   async groupDisband(request: {groupId: bigint}): Promise<datatypes.Group> {
        let response: command.GroupDisbandResponse = await this.stubs.groupCommandStub.groupDisband(request)
        return response.group!
    }

   async groupLeave(request: {groupId: bigint}): Promise<datatypes.Group> {
        let response: command.GroupLeaveResponse = await this.stubs.groupCommandStub.groupLeave(request)
        return response.group!
    }

   async groupUpdate(request: {group: datatypes.Group}): Promise<datatypes.Group> {
        let response: command.GroupUpdateResponse = await this.stubs.groupCommandStub.groupUpdate(request)
        return response.group!
    }

   async groupUnsetPhoto(request: {groupId: bigint}): Promise<datatypes.Group> {
        let response: command.GroupUnsetPhotoResponse = await this.stubs.groupCommandStub.groupUnsetPhoto(request)
        return response.group!
    }

	// GroupSetPhoto: cannot generate code for client and bidirectional streaming

   async groupDownloadPhoto(request: {groupId: bigint}): Promise<Uint8Array> {
        let response: command.GroupDownloadPhotoResponse = await this.stubs.groupCommandStub.groupDownloadPhoto(request)
        return response.photo!
    }

    /*
    ** DiscussionCommandService
    */
   discussionList(request: {filter?: datatypes.DiscussionFilter} = {}): AsyncIterable<datatypes.Discussion> {
        async function *list(discussionCommandStub: Client<typeof services.DiscussionCommandService>): AsyncIterable<datatypes.Discussion> {
            for await (const response of discussionCommandStub.discussionList(request)) {
                for (const element of response.discussions) {
                    yield element;
                }
            }
        }
        return list(this.stubs.discussionCommandStub);
    }

   async discussionGet(request: {discussionId: bigint}): Promise<datatypes.Discussion> {
        let response: command.DiscussionGetResponse = await this.stubs.discussionCommandStub.discussionGet(request)
        return response.discussion!
    }

   async discussionGetBytesIdentifier(request: {discussionId: bigint}): Promise<Uint8Array> {
        let response: command.DiscussionGetBytesIdentifierResponse = await this.stubs.discussionCommandStub.discussionGetBytesIdentifier(request)
        return response.identifier!
    }

   async discussionGetByContact(request: {contactId: bigint}): Promise<datatypes.Discussion> {
        let response: command.DiscussionGetByContactResponse = await this.stubs.discussionCommandStub.discussionGetByContact(request)
        return response.discussion!
    }

   async discussionGetByGroup(request: {groupId: bigint}): Promise<datatypes.Discussion> {
        let response: command.DiscussionGetByGroupResponse = await this.stubs.discussionCommandStub.discussionGetByGroup(request)
        return response.discussion!
    }

   async discussionEmpty(request: {discussionId: bigint}): Promise<void> {
        await this.stubs.discussionCommandStub.discussionEmpty(request)
    }

   async discussionDownloadPhoto(request: {discussionId: bigint}): Promise<Uint8Array> {
        let response: command.DiscussionDownloadPhotoResponse = await this.stubs.discussionCommandStub.discussionDownloadPhoto(request)
        return response.photo!
    }

   discussionLockedList(request: {} = {}): AsyncIterable<datatypes.Discussion> {
        async function *list(discussionCommandStub: Client<typeof services.DiscussionCommandService>): AsyncIterable<datatypes.Discussion> {
            for await (const response of discussionCommandStub.discussionLockedList(request)) {
                for (const element of response.discussions) {
                    yield element;
                }
            }
        }
        return list(this.stubs.discussionCommandStub);
    }

   async discussionLockedDelete(request: {discussionId: bigint}): Promise<void> {
        await this.stubs.discussionCommandStub.discussionLockedDelete(request)
    }

    /*
    ** MessageCommandService
    */
   messageList(request: {filter?: datatypes.MessageFilter, unread?: boolean} = {}): AsyncIterable<datatypes.Message> {
        async function *list(messageCommandStub: Client<typeof services.MessageCommandService>): AsyncIterable<datatypes.Message> {
            for await (const response of messageCommandStub.messageList(request)) {
                for (const element of response.messages) {
                    yield element;
                }
            }
        }
        return list(this.stubs.messageCommandStub);
    }

   async messageGet(request: {messageId: datatypes.MessageId}): Promise<datatypes.Message> {
        let response: command.MessageGetResponse = await this.stubs.messageCommandStub.messageGet(request)
        return response.message!
    }

   async messageRefresh(request: {} = {}): Promise<void> {
        await this.stubs.messageCommandStub.messageRefresh(request)
    }

   async messageDelete(request: {messageId: datatypes.MessageId, deleteEverywhere?: boolean}): Promise<void> {
        await this.stubs.messageCommandStub.messageDelete(request)
    }

   async messageSend(request: {discussionId: bigint, body: string, replyId?: datatypes.MessageId, ephemerality?: datatypes.MessageEphemerality, disableLinkPreview?: boolean}): Promise<datatypes.Message> {
        let response: command.MessageSendResponse = await this.stubs.messageCommandStub.messageSend(request)
        return response.message!
    }

	// MessageSendWithAttachments: cannot generate code for client and bidirectional streaming

   async messageSendLocation(request: {discussionId: bigint, latitude: number, longitude: number, altitude?: number, precision?: number, address?: string, previewFilename?: string, previewPayload?: Uint8Array, ephemerality?: datatypes.MessageEphemerality}): Promise<datatypes.Message> {
        let response: command.MessageSendLocationResponse = await this.stubs.messageCommandStub.messageSendLocation(request)
        return response.message!
    }

   async messageStartLocationSharing(request: {discussionId: bigint, latitude: number, longitude: number, altitude?: number, precision?: number}): Promise<datatypes.Message> {
        let response: command.MessageStartLocationSharingResponse = await this.stubs.messageCommandStub.messageStartLocationSharing(request)
        return response.message!
    }

   async messageUpdateLocationSharing(request: {messageId: datatypes.MessageId, latitude: number, longitude: number, altitude?: number, precision?: number}): Promise<datatypes.Message> {
        let response: command.MessageUpdateLocationSharingResponse = await this.stubs.messageCommandStub.messageUpdateLocationSharing(request)
        return response.message!
    }

   async messageEndLocationSharing(request: {messageId: datatypes.MessageId}): Promise<datatypes.Message> {
        let response: command.MessageEndLocationSharingResponse = await this.stubs.messageCommandStub.messageEndLocationSharing(request)
        return response.message!
    }

   async messageReact(request: {messageId: datatypes.MessageId, reaction?: string}): Promise<void> {
        await this.stubs.messageCommandStub.messageReact(request)
    }

   async messageUpdateBody(request: {messageId: datatypes.MessageId, updatedBody: string}): Promise<void> {
        await this.stubs.messageCommandStub.messageUpdateBody(request)
    }

    /*
    ** AttachmentCommandService
    */
   attachmentList(request: {filter?: datatypes.AttachmentFilter} = {}): AsyncIterable<datatypes.Attachment> {
        async function *list(attachmentCommandStub: Client<typeof services.AttachmentCommandService>): AsyncIterable<datatypes.Attachment> {
            for await (const response of attachmentCommandStub.attachmentList(request)) {
                for (const element of response.attachments) {
                    yield element;
                }
            }
        }
        return list(this.stubs.attachmentCommandStub);
    }

   async attachmentGet(request: {attachmentId: datatypes.AttachmentId}): Promise<datatypes.Attachment> {
        let response: command.AttachmentGetResponse = await this.stubs.attachmentCommandStub.attachmentGet(request)
        return response.attachment!
    }

   async attachmentDelete(request: {attachmentId: datatypes.AttachmentId, deleteEverywhere?: boolean}): Promise<void> {
        await this.stubs.attachmentCommandStub.attachmentDelete(request)
    }

   attachmentDownload(request: {attachmentId: datatypes.AttachmentId}): AsyncIterable<Uint8Array> {
        async function *list(attachmentCommandStub: Client<typeof services.AttachmentCommandService>): AsyncIterable<Uint8Array> {
            for await (const response of attachmentCommandStub.attachmentDownload(request)) {
                yield response.chunk;
            }
        }
        return list(this.stubs.attachmentCommandStub);
    }

    /*
    ** StorageCommandService
    */
   storageList(request: {filter?: datatypes.StorageElementFilter} = {}): AsyncIterable<datatypes.StorageElement> {
        async function *list(storageCommandStub: Client<typeof services.StorageCommandService>): AsyncIterable<datatypes.StorageElement> {
            for await (const response of storageCommandStub.storageList(request)) {
                for (const element of response.elements) {
                    yield element;
                }
            }
        }
        return list(this.stubs.storageCommandStub);
    }

   async storageGet(request: {key: string}): Promise<string> {
        let response: command.StorageGetResponse = await this.stubs.storageCommandStub.storageGet(request)
        return response.value!
    }

   async storageSet(request: {key: string, value: string}): Promise<string> {
        let response: command.StorageSetResponse = await this.stubs.storageCommandStub.storageSet(request)
        return response.previousValue!
    }

   async storageUnset(request: {key: string}): Promise<string> {
        let response: command.StorageUnsetResponse = await this.stubs.storageCommandStub.storageUnset(request)
        return response.previousValue!
    }

    /*
    ** DiscussionStorageCommandService
    */
   discussionStorageList(request: {discussionId: bigint, filter?: datatypes.StorageElementFilter}): AsyncIterable<datatypes.StorageElement> {
        async function *list(discussionStorageCommandStub: Client<typeof services.DiscussionStorageCommandService>): AsyncIterable<datatypes.StorageElement> {
            for await (const response of discussionStorageCommandStub.discussionStorageList(request)) {
                for (const element of response.elements) {
                    yield element;
                }
            }
        }
        return list(this.stubs.discussionStorageCommandStub);
    }

   async discussionStorageGet(request: {discussionId: bigint, key: string}): Promise<string> {
        let response: command.DiscussionStorageGetResponse = await this.stubs.discussionStorageCommandStub.discussionStorageGet(request)
        return response.value!
    }

   async discussionStorageSet(request: {discussionId: bigint, key: string, value: string}): Promise<string> {
        let response: command.DiscussionStorageSetResponse = await this.stubs.discussionStorageCommandStub.discussionStorageSet(request)
        return response.previousValue!
    }

   async discussionStorageUnset(request: {discussionId: bigint, key: string}): Promise<string> {
        let response: command.DiscussionStorageUnsetResponse = await this.stubs.discussionStorageCommandStub.discussionStorageUnset(request)
        return response.previousValue!
    }

    /*
    ** CallCommandService
    */
   async callStartDiscussionCall(request: {discussionId: bigint}): Promise<string> {
        let response: command.CallStartDiscussionCallResponse = await this.stubs.callCommandStub.callStartDiscussionCall(request)
        return response.callIdentifier!
    }

   async callStartCustomCall(request: {contactIds?: bigint[], discussionId?: bigint}): Promise<string> {
        let response: command.CallStartCustomCallResponse = await this.stubs.callCommandStub.callStartCustomCall(request)
        return response.callIdentifier!
    }

    /*
    ** SettingsCommandService
    */
   async settingsIdentityGet(request: {} = {}): Promise<datatypes.IdentitySettings> {
        let response: command.SettingsIdentityGetResponse = await this.stubs.settingsCommandStub.settingsIdentityGet(request)
        return response.identitySettings!
    }

   async settingsIdentitySet(request: {identitySettings: datatypes.IdentitySettings}): Promise<datatypes.IdentitySettings> {
        let response: command.SettingsIdentitySetResponse = await this.stubs.settingsCommandStub.settingsIdentitySet(request)
        return response.identitySettings!
    }

   async settingsDiscussionGet(request: {discussionId: bigint}): Promise<datatypes.DiscussionSettings> {
        let response: command.SettingsDiscussionGetResponse = await this.stubs.settingsCommandStub.settingsDiscussionGet(request)
        return response.discussionSettings!
    }

   async settingsDiscussionSet(request: {discussionSettings: datatypes.DiscussionSettings}): Promise<datatypes.DiscussionSettings> {
        let response: command.SettingsDiscussionSetResponse = await this.stubs.settingsCommandStub.settingsDiscussionSet(request)
        return response.discussionSettings!
    }

    /*
    ** InvitationNotificationService
    */
    public onInvitationReceived(args: {callback: (invitation: datatypes.Invitation) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.InvitationFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.InvitationReceivedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.invitation!))
                .catch(e => {
                    console.error("onInvitationReceived", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onInvitationReceived: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.invitationNotificationStub.invitationReceived({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onInvitationSent(args: {callback: (invitation: datatypes.Invitation) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.InvitationFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.InvitationSentNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.invitation!))
                .catch(e => {
                    console.error("onInvitationSent", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onInvitationSent: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.invitationNotificationStub.invitationSent({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onInvitationDeleted(args: {callback: (invitation: datatypes.Invitation) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.InvitationFilter, invitationIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.InvitationDeletedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.invitation!))
                .catch(e => {
                    console.error("onInvitationDeleted", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onInvitationDeleted: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.invitationNotificationStub.invitationDeleted({count: args.count, filter: args.filter, invitationIds: args.invitationIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onInvitationUpdated(args: {callback: (invitation: datatypes.Invitation, previousInvitationStatus: datatypes.Invitation_Status) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.InvitationFilter, invitationIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.InvitationUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.invitation!, notification.previousInvitationStatus!))
                .catch(e => {
                    console.error("onInvitationUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onInvitationUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.invitationNotificationStub.invitationUpdated({count: args.count, filter: args.filter, invitationIds: args.invitationIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    /*
    ** ContactNotificationService
    */
    public onContactNew(args: {callback: (contact: datatypes.Contact) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.ContactFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.ContactNewNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.contact!))
                .catch(e => {
                    console.error("onContactNew", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onContactNew: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.contactNotificationStub.contactNew({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onContactDeleted(args: {callback: (contact: datatypes.Contact) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.ContactFilter, contactIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.ContactDeletedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.contact!))
                .catch(e => {
                    console.error("onContactDeleted", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onContactDeleted: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.contactNotificationStub.contactDeleted({count: args.count, filter: args.filter, contactIds: args.contactIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onContactDetailsUpdated(args: {callback: (contact: datatypes.Contact, previousDetails: datatypes.IdentityDetails) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.ContactFilter, contactIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.ContactDetailsUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.contact!, notification.previousDetails!))
                .catch(e => {
                    console.error("onContactDetailsUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onContactDetailsUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.contactNotificationStub.contactDetailsUpdated({count: args.count, filter: args.filter, contactIds: args.contactIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onContactPhotoUpdated(args: {callback: (contact: datatypes.Contact) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.ContactFilter, contactIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.ContactPhotoUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.contact!))
                .catch(e => {
                    console.error("onContactPhotoUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onContactPhotoUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.contactNotificationStub.contactPhotoUpdated({count: args.count, filter: args.filter, contactIds: args.contactIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    /*
    ** GroupNotificationService
    */
    public onGroupNew(args: {callback: (group: datatypes.Group) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupFilter?: datatypes.GroupFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupNewNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!))
                .catch(e => {
                    console.error("onGroupNew", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupNew: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupNew({count: args.count, groupFilter: args.groupFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupDeleted(args: {callback: (group: datatypes.Group) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupDeletedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!))
                .catch(e => {
                    console.error("onGroupDeleted", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupDeleted: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupDeleted({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupNameUpdated(args: {callback: (group: datatypes.Group, previousName: string) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, previousNameSearch?: string}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupNameUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.previousName!))
                .catch(e => {
                    console.error("onGroupNameUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupNameUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupNameUpdated({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, previousNameSearch: args.previousNameSearch}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupPhotoUpdated(args: {callback: (group: datatypes.Group) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupPhotoUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!))
                .catch(e => {
                    console.error("onGroupPhotoUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupPhotoUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupPhotoUpdated({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupDescriptionUpdated(args: {callback: (group: datatypes.Group, previousDescription: string) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, previousDescriptionSearch?: string}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupDescriptionUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.previousDescription!))
                .catch(e => {
                    console.error("onGroupDescriptionUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupDescriptionUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupDescriptionUpdated({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, previousDescriptionSearch: args.previousDescriptionSearch}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupPendingMemberAdded(args: {callback: (group: datatypes.Group, pendingMember: datatypes.PendingGroupMember) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, pendingMemberFilter?: datatypes.PendingGroupMemberFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupPendingMemberAddedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.pendingMember!))
                .catch(e => {
                    console.error("onGroupPendingMemberAdded", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupPendingMemberAdded: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupPendingMemberAdded({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, pendingMemberFilter: args.pendingMemberFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupPendingMemberRemoved(args: {callback: (group: datatypes.Group, pendingMember: datatypes.PendingGroupMember) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, pendingMemberFilter?: datatypes.PendingGroupMemberFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupPendingMemberRemovedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.pendingMember!))
                .catch(e => {
                    console.error("onGroupPendingMemberRemoved", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupPendingMemberRemoved: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupPendingMemberRemoved({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, pendingMemberFilter: args.pendingMemberFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupMemberJoined(args: {callback: (group: datatypes.Group, member: datatypes.GroupMember) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, memberFilter?: datatypes.GroupMemberFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupMemberJoinedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.member!))
                .catch(e => {
                    console.error("onGroupMemberJoined", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupMemberJoined: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupMemberJoined({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, memberFilter: args.memberFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupMemberLeft(args: {callback: (group: datatypes.Group, member: datatypes.GroupMember) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, memberFilter?: datatypes.GroupMemberFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupMemberLeftNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.member!))
                .catch(e => {
                    console.error("onGroupMemberLeft", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupMemberLeft: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupMemberLeft({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, memberFilter: args.memberFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupOwnPermissionsUpdated(args: {callback: (group: datatypes.Group, permissions: datatypes.GroupMemberPermissions, previousPermissions: datatypes.GroupMemberPermissions) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, permissionsFilter?: datatypes.GroupPermissionFilter, previousPermissionsFilter?: datatypes.GroupPermissionFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupOwnPermissionsUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.permissions!, notification.previousPermissions!))
                .catch(e => {
                    console.error("onGroupOwnPermissionsUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupOwnPermissionsUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupOwnPermissionsUpdated({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, permissionsFilter: args.permissionsFilter, previousPermissionsFilter: args.previousPermissionsFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onGroupMemberPermissionsUpdated(args: {callback: (group: datatypes.Group, member: datatypes.GroupMember, previousPermissions: datatypes.GroupMemberPermissions) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, groupIds?: bigint[], groupFilter?: datatypes.GroupFilter, memberFilter?: datatypes.GroupMemberFilter, previousPermissionFilter?: datatypes.GroupMemberFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.GroupMemberPermissionsUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.group!, notification.member!, notification.previousPermissions!))
                .catch(e => {
                    console.error("onGroupMemberPermissionsUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onGroupMemberPermissionsUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.groupNotificationStub.groupMemberPermissionsUpdated({count: args.count, groupIds: args.groupIds, groupFilter: args.groupFilter, memberFilter: args.memberFilter, previousPermissionFilter: args.previousPermissionFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    /*
    ** DiscussionNotificationService
    */
    public onDiscussionNew(args: {callback: (discussion: datatypes.Discussion) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.DiscussionFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.DiscussionNewNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.discussion!))
                .catch(e => {
                    console.error("onDiscussionNew", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onDiscussionNew: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.discussionNotificationStub.discussionNew({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onDiscussionLocked(args: {callback: (discussion: datatypes.Discussion) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.DiscussionFilter, discussionIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.DiscussionLockedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.discussion!))
                .catch(e => {
                    console.error("onDiscussionLocked", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onDiscussionLocked: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.discussionNotificationStub.discussionLocked({count: args.count, filter: args.filter, discussionIds: args.discussionIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onDiscussionTitleUpdated(args: {callback: (discussion: datatypes.Discussion, previousTitle: string) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.DiscussionFilter, discussionIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.DiscussionTitleUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.discussion!, notification.previousTitle!))
                .catch(e => {
                    console.error("onDiscussionTitleUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onDiscussionTitleUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.discussionNotificationStub.discussionTitleUpdated({count: args.count, filter: args.filter, discussionIds: args.discussionIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onDiscussionSettingsUpdated(args: {callback: (discussion: datatypes.Discussion, newSettings: datatypes.DiscussionSettings, previousSettings: datatypes.DiscussionSettings) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.DiscussionFilter, discussionIds?: bigint[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.DiscussionSettingsUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.discussion!, notification.newSettings!, notification.previousSettings!))
                .catch(e => {
                    console.error("onDiscussionSettingsUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onDiscussionSettingsUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.discussionNotificationStub.discussionSettingsUpdated({count: args.count, filter: args.filter, discussionIds: args.discussionIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    /*
    ** MessageNotificationService
    */
    public onMessageReceived(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageReceivedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageReceived", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageReceived: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageReceived({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageSent(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageSentNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageSent", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageSent: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageSent({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageDeleted(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageDeletedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageDeleted", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageDeleted: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageDeleted({count: args.count, messageIds: args.messageIds, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageBodyUpdated(args: {callback: (message: datatypes.Message, previousBody: string) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageBodyUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!, notification.previousBody!))
                .catch(e => {
                    console.error("onMessageBodyUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageBodyUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageBodyUpdated({count: args.count, messageIds: args.messageIds, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageUploaded(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageUploadedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageUploaded", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageUploaded: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageUploaded({count: args.count, messageIds: args.messageIds, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageDelivered(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageDeliveredNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageDelivered", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageDelivered: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageDelivered({count: args.count, messageIds: args.messageIds, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageRead(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageReadNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageRead", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageRead: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageRead({count: args.count, messageIds: args.messageIds, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageLocationReceived(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageLocationReceivedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageLocationReceived", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageLocationReceived: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageLocationReceived({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageLocationSent(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageLocationSentNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageLocationSent", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageLocationSent: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageLocationSent({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageLocationSharingStart(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageLocationSharingStartNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageLocationSharingStart", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageLocationSharingStart: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageLocationSharingStart({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageLocationSharingUpdate(args: {callback: (message: datatypes.Message, previousLocation: datatypes.MessageLocation) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageLocationSharingUpdateNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!, notification.previousLocation!))
                .catch(e => {
                    console.error("onMessageLocationSharingUpdate", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageLocationSharingUpdate: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageLocationSharingUpdate({count: args.count, messageIds: args.messageIds, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageLocationSharingEnd(args: {callback: (message: datatypes.Message) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageLocationSharingEndNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!))
                .catch(e => {
                    console.error("onMessageLocationSharingEnd", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageLocationSharingEnd: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageLocationSharingEnd({count: args.count, messageIds: args.messageIds, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageReactionAdded(args: {callback: (message: datatypes.Message, reaction: datatypes.MessageReaction) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter, reactionFilter?: datatypes.ReactionFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageReactionAddedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!, notification.reaction!))
                .catch(e => {
                    console.error("onMessageReactionAdded", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageReactionAdded: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageReactionAdded({count: args.count, messageIds: args.messageIds, filter: args.filter, reactionFilter: args.reactionFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageReactionUpdated(args: {callback: (message: datatypes.Message, reaction: datatypes.MessageReaction, previousReaction: datatypes.MessageReaction) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], messageFilter?: datatypes.MessageFilter, reactionFilter?: datatypes.ReactionFilter, previousReactionFilter?: datatypes.ReactionFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageReactionUpdatedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!, notification.reaction!, notification.previousReaction!))
                .catch(e => {
                    console.error("onMessageReactionUpdated", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageReactionUpdated: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageReactionUpdated({count: args.count, messageIds: args.messageIds, messageFilter: args.messageFilter, reactionFilter: args.reactionFilter, previousReactionFilter: args.previousReactionFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onMessageReactionRemoved(args: {callback: (message: datatypes.Message, reaction: datatypes.MessageReaction) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, messageIds?: datatypes.MessageId[], filter?: datatypes.MessageFilter, reactionFilter?: datatypes.ReactionFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.MessageReactionRemovedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.message!, notification.reaction!))
                .catch(e => {
                    console.error("onMessageReactionRemoved", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onMessageReactionRemoved: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.messageNotificationStub.messageReactionRemoved({count: args.count, messageIds: args.messageIds, filter: args.filter, reactionFilter: args.reactionFilter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    /*
    ** AttachmentNotificationService
    */
    public onAttachmentReceived(args: {callback: (attachment: datatypes.Attachment) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.AttachmentFilter}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.AttachmentReceivedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.attachment!))
                .catch(e => {
                    console.error("onAttachmentReceived", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onAttachmentReceived: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.attachmentNotificationStub.attachmentReceived({count: args.count, filter: args.filter}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onAttachmentUploaded(args: {callback: (attachment: datatypes.Attachment) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint, filter?: datatypes.AttachmentFilter, messageIds?: datatypes.MessageId[], attachmentIds?: datatypes.AttachmentId[]}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.AttachmentUploadedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.attachment!))
                .catch(e => {
                    console.error("onAttachmentUploaded", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onAttachmentUploaded: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.attachmentNotificationStub.attachmentUploaded({count: args.count, filter: args.filter, messageIds: args.messageIds, attachmentIds: args.attachmentIds}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    /*
    ** CallNotificationService
    */
    public onCallIncomingCall(args: {callback: (callIdentifier: string, discussionId: bigint, participantId: datatypes.CallParticipantId, callerDisplayName: string, participantCount: number) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.CallIncomingCallNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.callIdentifier!, notification.discussionId!, notification.participantId!, notification.callerDisplayName!, notification.participantCount!))
                .catch(e => {
                    console.error("onCallIncomingCall", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onCallIncomingCall: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.callNotificationStub.callIncomingCall({count: args.count}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onCallRinging(args: {callback: (callIdentifier: string, participantId: datatypes.CallParticipantId) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.CallRingingNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.callIdentifier!, notification.participantId!))
                .catch(e => {
                    console.error("onCallRinging", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onCallRinging: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.callNotificationStub.callRinging({count: args.count}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onCallAccepted(args: {callback: (callIdentifier: string, participantId: datatypes.CallParticipantId) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.CallAcceptedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.callIdentifier!, notification.participantId!))
                .catch(e => {
                    console.error("onCallAccepted", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onCallAccepted: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.callNotificationStub.callAccepted({count: args.count}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onCallDeclined(args: {callback: (callIdentifier: string, participantId: datatypes.CallParticipantId) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.CallDeclinedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.callIdentifier!, notification.participantId!))
                .catch(e => {
                    console.error("onCallDeclined", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onCallDeclined: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.callNotificationStub.callDeclined({count: args.count}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onCallBusy(args: {callback: (callIdentifier: string, participantId: datatypes.CallParticipantId) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.CallBusyNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.callIdentifier!, notification.participantId!))
                .catch(e => {
                    console.error("onCallBusy", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onCallBusy: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.callNotificationStub.callBusy({count: args.count}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }

    public onCallEnded(args: {callback: (callIdentifier: string) => Promise<void> | void, endCallback?: (error ?: Error) => void, count?: bigint}): Function {
        let cancelFn: Function;
        const callbackId = crypto.randomUUID();
        this.activeCallbacks.add(callbackId);

        let wrappedCallback = (notification: notification.CallEndedNotification) => {
            Promise.resolve()
                .then(() => args.callback.call(this, notification.callIdentifier!))
                .catch(e => {
                    console.error("onCallEnded", e);
                });
        };

        let wrappedEndCallback = (error ?: Error) => {
            if (error) {
                console.error("onCallEnded: unexpected error", error);
            }
            args.endCallback ? args.endCallback(error) : undefined;
            this.activeCallbacks.delete(callbackId);
            this.callbackUpdate.emit("removed");
        }

        cancelFn = this.stubs.callNotificationStub.callEnded({count: args.count}, wrappedCallback, wrappedEndCallback, {signal: this.callbacksAbort.signal});
        return cancelFn;
    }


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
}
