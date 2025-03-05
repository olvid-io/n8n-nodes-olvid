// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/notification_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { OlvidClient, notifications, datatypes } from '@olvid/bot-node';
import type { ITriggerFunctions } from 'n8n-workflow';

export function discussionNew(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// discussion.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.DiscussionNewNotification) => {
		this.emit([this.helpers.returnJsonArray({id: Number(notification?.discussion?.id), title: notification?.discussion?.title, contactId: notification?.discussion?.identifier.case === 'contactId' ? Number(notification?.discussion?.identifier.value) : undefined, groupId: notification?.discussion?.identifier.case === 'groupId' ? Number(notification?.discussion?.identifier.value) : undefined})]);
		onCallback?.();
	}

	return client.stubs.discussionNotificationStub.discussionNew({}, callback, () => {});
}
