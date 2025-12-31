import { IExecuteFunctions,
	IDataObject,
	IHttpRequestOptions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription, 
} from 'n8n-workflow';


export class Simotel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Simotel',
		name: 'simotel',
		icon: 'file:nasim.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		description: 'Interact with Simotel API',
		defaults: { name: 'Simotel' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'simotelApi',
				required: true,
				testedBy: 'report:search', // Tells n8n this node tests the credential
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'User', value: 'user' },
					{ name: 'Report', value: 'report' },
				],
				default: 'user',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['report'] } },
				options: [
					{
						name: 'Search Polls',
						value: 'search',
						action: 'Search polls a report',
						description: 'Search call reports',
					},
				],
				default: 'search',
			},
			{
				displayName: 'User Name',
				name: 'userName',
				type: 'string',
				displayOptions: { show: { resource: ['user'] } },
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('simotelApi');

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				// Fixed: Using IHttpRequestOptions instead of 'any'
				const options: IHttpRequestOptions = {
					url: `${credentials.serverAddress}`,
					method: 'POST',
					headers: {
						'X-APIKEY': credentials.apiKey as string,
					},
					auth: {
						username: credentials.apiUser as string,
						password: credentials.apiPass as string,
					},
					body: {} as IDataObject,
					json: true,
				};

				if (resource === 'user') {
					options.url = `${credentials.serverAddress}/pbx/users/add`;
					options.body = {
						name: this.getNodeParameter('userName', i) as string,
						user_type: 'SIP',
						active: 'yes',
					};
				} else if (resource === 'report' && operation === 'search') {
					options.url = `${credentials.serverAddress}/reports/poll/search`;
					options.body = {
						conditions: { from: '', to: '' },
						date_range: { from: '2024-01-01 00:00', to: '2024-12-31 23:59' },
						pagination: { start: 0, count: 20 },
					};
				}

				// Fixed: Changed 'this.helpers.request' to 'this.helpers.httpRequest'
				const responseData = await this.helpers.httpRequest(options);
				returnData.push({ json: responseData });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}
		return [returnData];
	}
}