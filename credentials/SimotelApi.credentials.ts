import { ICredentialType, INodeProperties, Icon } from 'n8n-workflow';

export class SimotelApi implements ICredentialType {
	name = 'simotelApi';
	displayName = 'Simotel API';
	icon = 'fa:key' as Icon;
	documentationUrl = 'https://doc.simotel.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Server Address',
			name: 'serverAddress',
			type: 'string',
			default: 'http://192.168.1.1/api/v4',
			required: true,
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'API User (Basic Auth)',
			name: 'apiUser',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'API Password (Basic Auth)',
			name: 'apiPass',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];
}