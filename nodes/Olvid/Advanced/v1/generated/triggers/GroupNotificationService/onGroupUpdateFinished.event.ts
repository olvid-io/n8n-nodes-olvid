// @generated by protoc-gen-n8n-actions v1 with parameter "target=ts"
// @generated from file olvid/daemon/services/v1/notification_service.proto (package olvid.daemon.services.v1, syntax proto3)
/* eslint-disable */

import { OlvidClient, notifications, datatypes } from '@olvid/bot-node';
import type { ITriggerFunctions } from 'n8n-workflow';

export function groupUpdateFinished(this: ITriggerFunctions, client: OlvidClient, onCallback?: Function, returnMockData: boolean = false): Function {
    if (returnMockData) {
        this.emit([this.helpers.returnJsonArray([{
// groupId.mockData
        }])]);
        onCallback?.();
        return () => {};
    }

	const callback = (notification: notifications.GroupUpdateFinishedNotification) => {
		this.emit([this.helpers.returnJsonArray({groupId: Number(notification?.groupId)
})]);
		onCallback?.();
	}

	return client.stubs.groupNotificationStub.groupUpdateFinished({}, callback, () => {});
}
