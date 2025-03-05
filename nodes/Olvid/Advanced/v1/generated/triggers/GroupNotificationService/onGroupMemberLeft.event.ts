// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/notification_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { OlvidClient, notifications, datatypes } from '@olvid/bot-node';
import type { ITriggerFunctions } from 'n8n-workflow';

export function groupMemberLeft(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// group.mockData,
// member.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.GroupMemberLeftNotification) => {
		this.emit([this.helpers.returnJsonArray([{group: {id: Number(notification?.group?.id), type: datatypes.Group_Type[notification?.group?.type ?? 0], advancedConfiguration: {readOnly: notification?.group?.advancedConfiguration?.readOnly, remoteDelete: datatypes.Group_AdvancedConfiguration_RemoteDelete[notification?.group?.advancedConfiguration?.remoteDelete ?? 0]}, ownPermissions: {admin: notification?.group?.ownPermissions?.admin, remoteDeleteAnything: notification?.group?.ownPermissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: notification?.group?.ownPermissions?.editOrRemoteDeleteOwnMessages, changeSettings: notification?.group?.ownPermissions?.changeSettings, sendMessage: notification?.group?.ownPermissions?.sendMessage}, members: notification?.group?.members.map(e => ({contactId: Number(e.contactId), permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), pendingMembers: notification?.group?.pendingMembers.map(e => ({pendingMemberId: Number(e.pendingMemberId), contactId: Number(e.contactId), displayName: e.displayName, declined: e.declined, permissions: {admin: e.permissions?.admin, remoteDeleteAnything: e.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: e.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: e.permissions?.changeSettings, sendMessage: e.permissions?.sendMessage}})), updateInProgress: notification?.group?.updateInProgress, keycloakManaged: notification?.group?.keycloakManaged, name: notification?.group?.name, description: notification?.group?.description, hasAPhoto: notification?.group?.hasAPhoto}},{member: {contactId: Number(notification?.member?.contactId), permissions: {admin: notification?.member?.permissions?.admin, remoteDeleteAnything: notification?.member?.permissions?.remoteDeleteAnything, editOrRemoteDeleteOwnMessages: notification?.member?.permissions?.editOrRemoteDeleteOwnMessages, changeSettings: notification?.member?.permissions?.changeSettings, sendMessage: notification?.member?.permissions?.sendMessage}}}])]);
		onCallback?.();
	}

	return client.stubs.groupNotificationStub.groupMemberLeft({}, callback, () => {});
}
