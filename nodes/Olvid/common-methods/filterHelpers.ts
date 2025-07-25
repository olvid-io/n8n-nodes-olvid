import { ITriggerFunctions } from 'n8n-workflow';
import * as datatypes from '../protobuf/olvid/daemon/datatypes/v1/datatypes';

/**
 * Helper functions to build Olvid filters from n8n node parameters
 */

/**
 * Build a ReactionFilter from n8n reactionFilters collection parameter
 */
export function buildReactionFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.ReactionFilter | undefined {
	const reactionFilters = triggerFunctions.getNodeParameter('reactionFilters') as any;

	if (!reactionFilters || Object.keys(reactionFilters).length === 0) {
		return undefined;
	}

	const filter: any = {};

	// Reaction emoji filter
	if (reactionFilters.reaction) {
		filter.reaction = reactionFilters.reaction as string;
	}

	// Reacted by filter
	if (reactionFilters.reactedBy && reactionFilters.reactedBy !== 'any') {
		const reactedByValue = reactionFilters.reactedBy as string;
		if (reactedByValue === 'me') {
			filter.reactedBy = { value: true, case: 'reactedByMe' };
		} else if (
			reactedByValue === 'contact' &&
			reactionFilters.reactedByContactId &&
			reactionFilters.reactedByContactId > 0
		) {
			filter.reactedBy = {
				value: BigInt(reactionFilters.reactedByContactId as number),
				case: 'reactedByContactId',
			};
		}
	}

	// Return the filter only if it has some content
	if (Object.keys(filter).length === 0) {
		return undefined;
	}

	return new datatypes.ReactionFilter(filter);
}

/**
 * Build a MessageFilter from n8n messageFilters collection parameter
 */
export function buildMessageFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.MessageFilter | undefined {
	const messageFilters = triggerFunctions.getNodeParameter('messageFilters') as any;

	if (!messageFilters || Object.keys(messageFilters).length === 0) {
		return undefined;
	}

	const filter: any = {};

	// Body search (regex)
	if (messageFilters.bodySearch) {
		filter.bodySearch = messageFilters.bodySearch as string;
	}

	// Message type (inbound/outbound)
	if (messageFilters.messageType && messageFilters.messageType !== 'TYPE_UNSPECIFIED') {
		const typeValue = messageFilters.messageType as string;
		if (typeValue === 'TYPE_INBOUND') {
			filter.type = datatypes.MessageId_Type.INBOUND;
		} else if (typeValue === 'TYPE_OUTBOUND') {
			filter.type = datatypes.MessageId_Type.OUTBOUND;
		}
	}

	// Sender contact ID
	if (messageFilters.senderContactId && messageFilters.senderContactId > 0) {
		filter.senderContactId = BigInt(messageFilters.senderContactId as number);
	}

	// Discussion ID
	if (messageFilters.discussionId && messageFilters.discussionId > 0) {
		filter.discussionId = BigInt(messageFilters.discussionId as number);
	}

	// Attachment filter
	if (messageFilters.hasAttachments && messageFilters.hasAttachments !== 'ATTACHMENT_UNSPECIFIED') {
		const attachmentValue = messageFilters.hasAttachments as string;
		if (attachmentValue === 'ATTACHMENT_HAVE') {
			filter.attachment = datatypes.MessageFilter_Attachment.HAVE;
		} else if (attachmentValue === 'ATTACHMENT_HAVE_NOT') {
			filter.attachment = datatypes.MessageFilter_Attachment.HAVE_NOT;
		}
	}

	// Location filter
	if (messageFilters.hasLocation && messageFilters.hasLocation !== 'LOCATION_UNSPECIFIED') {
		const locationValue = messageFilters.hasLocation as string;
		switch (locationValue) {
			case 'LOCATION_HAVE':
				filter.location = datatypes.MessageFilter_Location.HAVE;
				break;
			case 'LOCATION_HAVE_NOT':
				filter.location = datatypes.MessageFilter_Location.HAVE_NOT;
				break;
			case 'LOCATION_IS_SEND':
				filter.location = datatypes.MessageFilter_Location.IS_SEND;
				break;
			case 'LOCATION_IS_SHARING':
				filter.location = datatypes.MessageFilter_Location.IS_SHARING;
				break;
			case 'LOCATION_IS_SHARING_FINISHED':
				filter.location = datatypes.MessageFilter_Location.IS_SHARING_FINISHED;
				break;
		}
	}

	// Reaction filter
	if (messageFilters.hasReactions && messageFilters.hasReactions !== 'REACTION_UNSPECIFIED') {
		const reactionValue = messageFilters.hasReactions as string;
		if (reactionValue === 'REACTION_HAS') {
			filter.hasReaction = datatypes.MessageFilter_Reaction.HAS;
		} else if (reactionValue === 'REACTION_HAS_NOT') {
			filter.hasReaction = datatypes.MessageFilter_Reaction.HAS_NOT;
		}
	}

	// Time range filter
	if (messageFilters.timeRange) {
		const timeRange = messageFilters.timeRange as any;
		if (timeRange.minTimestamp) {
			const minDate = new Date(timeRange.minTimestamp as string);
			filter.minTimestamp = BigInt(minDate.getTime());
		}
		if (timeRange.maxTimestamp) {
			const maxDate = new Date(timeRange.maxTimestamp as string);
			filter.maxTimestamp = BigInt(maxDate.getTime());
		}
	}

	// Reply filter
	if (messageFilters.replyFilter && messageFilters.replyFilter !== 'none') {
		const replyValue = messageFilters.replyFilter as string;
		if (replyValue === 'reply_to_a_message') {
			filter.reply = { value: true, case: 'replyToAMessage' };
		} else if (replyValue === 'do_not_reply_to_a_message') {
			filter.reply = { value: true, case: 'doNotReplyToAMessage' };
		}
	}

	// Reactions filter (specific reaction criteria)
	if (messageFilters.reactionsFilter) {
		const reactionsFilterArray = messageFilters.reactionsFilter as any[];
		if (reactionsFilterArray && reactionsFilterArray.length > 0) {
			const reactionFilters: datatypes.ReactionFilter[] = [];
			for (const reactionFilterData of reactionsFilterArray) {
				const reactionFilter: any = {};

				if (reactionFilterData.reaction) {
					reactionFilter.reaction = reactionFilterData.reaction as string;
				}

				if (reactionFilterData.reactedBy && reactionFilterData.reactedBy !== 'any') {
					const reactedByValue = reactionFilterData.reactedBy as string;
					if (reactedByValue === 'me') {
						reactionFilter.reactedBy = { value: true, case: 'reactedByMe' };
					} else if (
						reactedByValue === 'contact' &&
						reactionFilterData.reactedByContactId &&
						reactionFilterData.reactedByContactId > 0
					) {
						reactionFilter.reactedBy = {
							value: BigInt(reactionFilterData.reactedByContactId as number),
							case: 'reactedByContactId',
						};
					}
				}

				if (Object.keys(reactionFilter).length > 0) {
					reactionFilters.push(new datatypes.ReactionFilter(reactionFilter));
				}
			}

			if (reactionFilters.length > 0) {
				filter.reactionsFilter = reactionFilters;
			}
		}
	}

	// Return the filter only if it has some content
	if (Object.keys(filter).length === 0) {
		return undefined;
	}

	return new datatypes.MessageFilter(filter);
}

/**
 * Build an AttachmentFilter from n8n attachmentFilters collection parameter
 */
export function buildAttachmentFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.AttachmentFilter | undefined {
	const attachmentFilters = triggerFunctions.getNodeParameter('attachmentFilters') as any;

	if (!attachmentFilters || Object.keys(attachmentFilters).length === 0) {
		return undefined;
	}

	const filter: any = {};

	// File type filter
	if (attachmentFilters.fileType && attachmentFilters.fileType !== 'FILE_TYPE_UNSPECIFIED') {
		const fileTypeValue = attachmentFilters.fileType as string;
		switch (fileTypeValue) {
			case 'FILE_TYPE_IMAGE':
				filter.fileType = datatypes.AttachmentFilter_FileType.IMAGE;
				break;
			case 'FILE_TYPE_VIDEO':
				filter.fileType = datatypes.AttachmentFilter_FileType.VIDEO;
				break;
			case 'FILE_TYPE_IMAGE_VIDEO':
				filter.fileType = datatypes.AttachmentFilter_FileType.IMAGE_VIDEO;
				break;
			case 'FILE_TYPE_AUDIO':
				filter.fileType = datatypes.AttachmentFilter_FileType.AUDIO;
				break;
			case 'FILE_TYPE_LINK_PREVIEW':
				filter.fileType = datatypes.AttachmentFilter_FileType.LINK_PREVIEW;
				break;
			case 'FILE_TYPE_NOT_LINK_PREVIEW':
				filter.fileType = datatypes.AttachmentFilter_FileType.NOT_LINK_PREVIEW;
				break;
		}
	}

	// Filename search
	if (attachmentFilters.filenameSearch) {
		filter.filenameSearch = attachmentFilters.filenameSearch as string;
	}

	// MIME type search
	if (attachmentFilters.mimeTypeSearch) {
		filter.mimeTypeSearch = attachmentFilters.mimeTypeSearch as string;
	}

	// Size range filter
	if (attachmentFilters.sizeRange) {
		const sizeRange = attachmentFilters.sizeRange as any;
		if (sizeRange.minSize && sizeRange.minSize > 0) {
			filter.minSize = BigInt(sizeRange.minSize as number);
		}
		if (sizeRange.maxSize && sizeRange.maxSize > 0) {
			filter.maxSize = BigInt(sizeRange.maxSize as number);
		}
	}

	// Discussion ID
	if (attachmentFilters.discussionId && attachmentFilters.discussionId > 0) {
		filter.discussionId = BigInt(attachmentFilters.discussionId as number);
	}

	// Return the filter only if it has some content
	if (Object.keys(filter).length === 0) {
		return undefined;
	}

	return new datatypes.AttachmentFilter(filter);
}

/**
 * Build a ContactFilter from n8n contactFilters collection parameter
 */
export function buildContactFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.ContactFilter | undefined {
	const contactFilters = triggerFunctions.getNodeParameter('contactFilters') as any;

	if (!contactFilters || Object.keys(contactFilters).length === 0) {
		return undefined;
	}

	const filter: any = {};

	// Display name search
	if (contactFilters.displayNameSearch) {
		filter.displayNameSearch = contactFilters.displayNameSearch as string;
	}

	// Details search (position and company)
	if (contactFilters.positionSearch || contactFilters.companySearch) {
		const detailsSearch: any = {};
		if (contactFilters.positionSearch) {
			detailsSearch.position = contactFilters.positionSearch as string;
		}
		if (contactFilters.companySearch) {
			detailsSearch.company = contactFilters.companySearch as string;
		}
		if (Object.keys(detailsSearch).length > 0) {
			filter.detailsSearch = new datatypes.IdentityDetails(detailsSearch);
		}
	}

	// Return the filter only if it has some content
	if (Object.keys(filter).length === 0) {
		return undefined;
	}

	return new datatypes.ContactFilter(filter);
}

/**
 * Build a GroupFilter from n8n groupFilters collection parameter
 */
export function buildGroupFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.GroupFilter | undefined {
	const groupFilters = triggerFunctions.getNodeParameter('groupFilters') as any;

	if (!groupFilters || Object.keys(groupFilters).length === 0) {
		return undefined;
	}

	const filter: any = {};

	// Group name search
	if (groupFilters.nameSearch) {
		filter.nameSearch = groupFilters.nameSearch as string;
	}

	// Group description search
	if (groupFilters.descriptionSearch) {
		filter.descriptionSearch = groupFilters.descriptionSearch as string;
	}

	// Return the filter only if it has some content
	if (Object.keys(filter).length === 0) {
		return undefined;
	}

	return new datatypes.GroupFilter(filter);
}

/**
 * Build a DiscussionFilter from n8n discussionFilters collection parameter
 */
export function buildDiscussionFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.DiscussionFilter | undefined {
	const discussionFilters = triggerFunctions.getNodeParameter('discussionFilters') as any;

	if (!discussionFilters || Object.keys(discussionFilters).length === 0) {
		return undefined;
	}

	const filter: any = {};

	// Discussion title search
	if (discussionFilters.titleSearch) {
		filter.titleSearch = discussionFilters.titleSearch as string;
	}

	// Discussion type
	if (discussionFilters.discussionType && discussionFilters.discussionType !== 'TYPE_UNSPECIFIED') {
		const typeValue = discussionFilters.discussionType as string;
		if (typeValue === 'TYPE_OTO') {
			filter.type = datatypes.DiscussionFilter_Type.OTO;
		} else if (typeValue === 'TYPE_GROUP') {
			filter.type = datatypes.DiscussionFilter_Type.GROUP;
		}
	}

	// Return the filter only if it has some content
	if (Object.keys(filter).length === 0) {
		return undefined;
	}

	return new datatypes.DiscussionFilter(filter);
}

/**
 * Build an InvitationFilter from n8n invitationFilters collection parameter
 */
export function buildInvitationFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.InvitationFilter | undefined {
	const invitationFilters = triggerFunctions.getNodeParameter('invitationFilters') as any;

	if (!invitationFilters || Object.keys(invitationFilters).length === 0) {
		return undefined;
	}

	const filter: any = {};

	// Invitation status
	if (invitationFilters.status && invitationFilters.status !== 'STATUS_UNSPECIFIED') {
		const statusValue = invitationFilters.status as string;
		switch (statusValue) {
			case 'STATUS_INVITATION_WAIT_YOU_TO_ACCEPT':
				filter.status = datatypes.Invitation_Status.INVITATION_WAIT_YOU_TO_ACCEPT;
				break;
			case 'STATUS_INVITATION_WAIT_IT_TO_ACCEPT':
				filter.status = datatypes.Invitation_Status.INVITATION_WAIT_IT_TO_ACCEPT;
				break;
			case 'STATUS_INVITATION_STATUS_IN_PROGRESS':
				filter.status = datatypes.Invitation_Status.INVITATION_STATUS_IN_PROGRESS;
				break;
			case 'STATUS_GROUP_INVITATION_WAIT_YOU_TO_ACCEPT':
				filter.status = datatypes.Invitation_Status.GROUP_INVITATION_WAIT_YOU_TO_ACCEPT;
				break;
		}
	}

	// Display name search
	if (invitationFilters.displayNameSearch) {
		filter.displayNameSearch = invitationFilters.displayNameSearch as string;
	}

	// Return the filter only if it has some content
	if (Object.keys(filter).length === 0) {
		return undefined;
	}

	return new datatypes.InvitationFilter(filter);
}

/**
 * Build a MessageFilter from the legacy bodyRegexpFilter parameter (for backward compatibility)
 */
export function buildLegacyMessageFilter(
	triggerFunctions: ITriggerFunctions,
): datatypes.MessageFilter | undefined {
	try {
		const bodyRegexpFilter = triggerFunctions.getNodeParameter('bodyRegexpFilter') as string;
		if (bodyRegexpFilter && bodyRegexpFilter.trim() !== '') {
			return new datatypes.MessageFilter({ bodySearch: bodyRegexpFilter });
		}
	} catch (error) {
		// Parameter doesn't exist, which is fine for new format
	}
	return undefined;
}
