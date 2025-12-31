import {
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class SimotelTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Simotel Trigger',
		name: 'simotelTrigger',
		icon: 'file:nasim.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when Simotel sends an event via webhook',
		// Fix: Added usableAsTool property
		usableAsTool: true,
		defaults: {
			name: 'Simotel Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'simotelApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event Type',
				name: 'eventType',
				type: 'options',
				options: [
					{ name: 'Incoming Call', value: 'incoming_call' },
					{ name: 'Cdr (Call Records)', value: 'cdr' },
					{ name: 'New Voicemail', value: 'voicemail' },
				],
				default: 'incoming_call',
				description: 'The type of event to listen for',
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		// Fix: Removed unused headerData variable
		const bodyData = req.body as IDataObject;

		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}