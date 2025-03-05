import type { INodeProperties, IDataObject } from 'n8n-workflow';

export function createDurationPropertyOptions(options: {
  displayName: string;
  name: string;
  description: string;
  defaultValue: { mode: string; value: number };
}) {
  return {
    displayName: options.displayName,
    name: options.name,
    type: 'resourceLocator',
    default: options.defaultValue,
    // displayOptions: options.displayOptions,
    description: options.description,
    modes: ['Seconds', 'Minutes', 'Hours', 'Days'].map((unit) => ({
      displayName: unit,
      name: unit.toLowerCase(),
      type: 'string',
      placeholder: `e.g. ${unit === 'Seconds' ? 12 : 1}`,
      validation: [
        {
          type: 'regex',
          properties: {
            regex: '^[0-9]+$',
            errorMessage: 'Not a valid number',
          },
        },
      ],
    })),
  } as INodeProperties;
}

// Get Parameter
export function getDurationInSeconds(data: IDataObject, propertyName: string): bigint | undefined {
  const durationObject = data[propertyName] as { mode: string; value: number } | undefined;

  if (!durationObject) {
    return undefined;
  }

  const durationMap: Record<string, number> = {
    seconds: 1,
    minutes: 60,
    hours: 60 * 60,
    days: 60 * 60 * 24,
  };

  if (!(durationObject.mode in durationMap)) {
    throw new Error(`Invalid duration mode: ${durationObject.mode}`);
  }

  return BigInt(durationObject.value) * BigInt(durationMap[durationObject.mode]);
}
