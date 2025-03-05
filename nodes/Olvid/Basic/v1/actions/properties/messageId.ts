import { datatypes } from "@olvid/bot-node";
import { IDataObject, IExecuteFunctions, INodeProperties } from "n8n-workflow";

export const messageId: INodeProperties = {
    displayName: 'Message ID',
    name: 'messageId',
    type: 'number',
    default: 0,
    description: 'ID of the original message',
};
export const messageIdType: INodeProperties =
{
    displayName: 'Message Type',
    name: 'messageType',
    type: 'options',
    default: 'TYPE_INBOUND',
    options: [
        {
            name: 'Inbound',
            value: 'TYPE_INBOUND',
        },
        {
            name: 'Outbound',
            value: 'TYPE_OUTBOUND',
        },
    ],
    description:
        "Accepted values: 1 (Inbound), 2 (Outbound), TYPE_INBOUND, TYPE_OUTBOUND, INBOUND, or OUTBOUND. Don't pay attention to the warning 'The value ... is not supported!'",
    ignoreValidationDuringExecution: true,
};

function getType(this: IExecuteFunctions, value: string | number): datatypes.MessageId_Type {
    if (typeof value == 'number') {
        if (datatypes.MessageId_Type[value] === undefined) {
            throw new Error('The attachment type "${value}" is not known.');
        }
        return value as datatypes.MessageId_Type;
    }
    else {
        const enumKey = value.replace("TYPE_", "");
        return datatypes.MessageId_Type[enumKey as keyof typeof datatypes.MessageId_Type];
    }
}

export function getMessageIdCollection(this: IExecuteFunctions, itemMessageId: IDataObject): datatypes.MessageId | undefined {
    if (itemMessageId === undefined || itemMessageId['messageType'] === undefined || itemMessageId['messageId'] === undefined) {
        return undefined;
    }
    try {
        const type: datatypes.MessageId_Type = getType.call(this, itemMessageId['messageType'] as string | number);
        const id: bigint = BigInt(itemMessageId['messageId'] as number);

        return new datatypes.MessageId({ type, id });
    } catch (error) {
        console.log('Error in getMessageIdCollection, returning undefined');
        console.log(error);
        return undefined;
    }
}

export function getMessageId(this: IExecuteFunctions, index: number, idPropname: string = 'messageId', typePropname: string = 'messageType'): datatypes.MessageId | undefined {
    try {
        const type: datatypes.MessageId_Type = getType.call(this, this.getNodeParameter(typePropname, index) as string | number);
        const id: bigint = BigInt(this.getNodeParameter(idPropname, index) as number);

        return new datatypes.MessageId({ type, id });
    } catch (error) {
        console.log(error);
        return undefined;
    }
}
