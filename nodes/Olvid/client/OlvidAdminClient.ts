import {
    Client, createClient,
} from "@connectrpc/connect";
import * as services from "../protobuf/olvid/daemon/services/v1/services";
import * as datatypes from "../protobuf/olvid/daemon/datatypes/v1/datatypes";
import * as admin from "../protobuf/olvid/daemon/admin/v1/admin";
import {OlvidClient} from "./OlvidClient";

export class OlvidAdminClient extends OlvidClient {
    public currentIdentityId: number = 0;

    public readonly adminStubs: {
        clientKeyAdminStub: Client<typeof services.ClientKeyAdminService>;
        identityAdminStub: Client<typeof services.IdentityAdminService>;
        backupAdminStub: Client<typeof services.BackupAdminService>;

    };

    public constructor(serverUrl: string, clientKey: string) {
        super(serverUrl, clientKey);
        this.adminStubs = {
            clientKeyAdminStub: createClient(services.ClientKeyAdminService, this.transport),
            identityAdminStub: createClient(services.IdentityAdminService, this.transport),
            backupAdminStub: createClient(services.BackupAdminService, this.transport),

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

    /*
    ** ClientKeyAdminService
    */
   adminClientKeyList(request: {filter?: datatypes.ClientKeyFilter} = {}): AsyncIterable<datatypes.ClientKey> {
        async function *list(clientKeyAdminStub: Client<typeof services.ClientKeyAdminService>): AsyncIterable<datatypes.ClientKey> {
            for await (const response of clientKeyAdminStub.clientKeyList(request)) {
                for (const element of response.clientKeys) {
                    yield element;
                }
            }
        }
        return list(this.adminStubs.clientKeyAdminStub);
    }

   async adminClientKeyGet(request: {clientKey: string}): Promise<datatypes.ClientKey> {
        let response: admin.ClientKeyGetResponse = await this.adminStubs.clientKeyAdminStub.clientKeyGet(request)
        return response.clientKey!
    }

   async adminClientKeyNew(request: {name: string, identityId: bigint}): Promise<datatypes.ClientKey> {
        let response: admin.ClientKeyNewResponse = await this.adminStubs.clientKeyAdminStub.clientKeyNew(request)
        return response.clientKey!
    }

   async adminClientKeyDelete(request: {clientKey: string}): Promise<void> {
        await this.adminStubs.clientKeyAdminStub.clientKeyDelete(request)
    }

    /*
    ** IdentityAdminService
    */
   adminIdentityList(request: {filter?: datatypes.IdentityFilter} = {}): AsyncIterable<datatypes.Identity> {
        async function *list(identityAdminStub: Client<typeof services.IdentityAdminService>): AsyncIterable<datatypes.Identity> {
            for await (const response of identityAdminStub.identityList(request)) {
                for (const element of response.identities) {
                    yield element;
                }
            }
        }
        return list(this.adminStubs.identityAdminStub);
    }

   async adminIdentityAdminGet(request: {identityId: bigint}): Promise<datatypes.Identity> {
        let response: admin.IdentityAdminGetResponse = await this.adminStubs.identityAdminStub.identityAdminGet(request)
        return response.identity!
    }

   async adminIdentityAdminGetBytesIdentifier(request: {identityId: bigint}): Promise<Uint8Array> {
        let response: admin.IdentityAdminGetBytesIdentifierResponse = await this.adminStubs.identityAdminStub.identityAdminGetBytesIdentifier(request)
        return response.identifier!
    }

   async adminIdentityAdminGetInvitationLink(request: {identityId: bigint}): Promise<string> {
        let response: admin.IdentityAdminGetInvitationLinkResponse = await this.adminStubs.identityAdminStub.identityAdminGetInvitationLink(request)
        return response.invitationLink!
    }

   async adminIdentityAdminDownloadPhoto(request: {identityId: bigint}): Promise<Uint8Array> {
        let response: admin.IdentityAdminDownloadPhotoResponse = await this.adminStubs.identityAdminStub.identityAdminDownloadPhoto(request)
        return response.photo!
    }

   async adminIdentityDelete(request: {identityId: bigint, deleteEverywhere?: boolean}): Promise<void> {
        await this.adminStubs.identityAdminStub.identityDelete(request)
    }

   async adminIdentityNew(request: {identityDetails: datatypes.IdentityDetails, serverUrl?: string}): Promise<datatypes.Identity> {
        let response: admin.IdentityNewResponse = await this.adminStubs.identityAdminStub.identityNew(request)
        return response.identity!
    }

   async adminIdentityKeycloakNew(request: {configurationLink: string}): Promise<datatypes.Identity> {
        let response: admin.IdentityKeycloakNewResponse = await this.adminStubs.identityAdminStub.identityKeycloakNew(request)
        return response.identity!
    }

    /*
    ** BackupAdminService
    */
   async adminBackupKeyGet(request: {} = {}): Promise<string> {
        let response: admin.BackupKeyGetResponse = await this.adminStubs.backupAdminStub.backupKeyGet(request)
        return response.backupKey!
    }

   async adminBackupKeyRenew(request: {} = {}): Promise<string> {
        let response: admin.BackupKeyRenewResponse = await this.adminStubs.backupAdminStub.backupKeyRenew(request)
        return response.backupKey!
    }

   async adminBackupGet(request: {backupKey: string}): Promise<datatypes.Backup> {
        let response: admin.BackupGetResponse = await this.adminStubs.backupAdminStub.backupGet(request)
        return response.backup!
    }

   async adminBackupNow(request: {} = {}): Promise<void> {
        await this.adminStubs.backupAdminStub.backupNow(request)
    }

   async adminBackupRestoreDaemon(request: {backupKey: string, newDeviceName?: string}): Promise<admin.BackupRestoreDaemonResponse> {
        return await this.adminStubs.backupAdminStub.backupRestoreDaemon(request)
    }

   async adminBackupRestoreAdminBackup(request: {backupKey: string}): Promise<datatypes.ClientKey[]> {
        let response: admin.BackupRestoreAdminBackupResponse = await this.adminStubs.backupAdminStub.backupRestoreAdminBackup(request)
        return response.restoredAdminClientKeys!
    }

   async adminBackupRestoreProfileSnapshot(request: {backupKey: string, id: string, newDeviceName?: string}): Promise<admin.BackupRestoreProfileSnapshotResponse> {
        return await this.adminStubs.backupAdminStub.backupRestoreProfileSnapshot(request)
    }



}
