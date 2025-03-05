import { IDataObject, IExecuteFunctions, INodeProperties } from "n8n-workflow";
import { propNames } from "./propertiesNames";


export const discussionId: INodeProperties = // # Discussion
{
  displayName: 'Discussion',
  name: propNames.discussion,
  type: 'resourceLocator',
  default: { mode: 'list', value: '' },
  description: 'Select the discussion by name or ID',
  modes: [
    {
      displayName: 'By Name',
      name: 'list',
      type: 'list',
      placeholder: 'e.g. Alice',
      typeOptions: {
        searchListMethod: 'discussionSearch',
      },
    },
    {
      displayName: 'By ID',
      name: 'id',
      type: 'string',
      placeholder: 'e.g. 1',
      validation: [
        {
          type: 'regex',
          properties: {
            regex: '[0-9]+',
            errorMessage: 'Not a valid Olvid Discussion ID',
          },
        },
      ],
    },
  ],
};

// Get Parameter
export function getDiscussionId(fields: IDataObject | undefined): bigint | undefined {
  if (fields !== undefined) {
    const discussion = fields as { value: string; };
    return BigInt(discussion.value);
  }
  return undefined;
}

export function getDiscussionIdRequired(this: IExecuteFunctions, index: number): bigint {
  const fields = this.getNodeParameter(propNames.discussion, index) as IDataObject
  const discussion = fields as { value: string; };
  return BigInt(discussion.value);
}
