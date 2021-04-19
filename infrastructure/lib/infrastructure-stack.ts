import * as cdk from '@aws-cdk/core';
import { ClientConstruct } from './client-construct';
import { PublicApiConstruct } from './public-api-construct';
import { CoreConstruct } from './core-construct';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create the client infrastructure
    // new ClientConstruct(this, 'Client');
    const coreConstruct = new CoreConstruct(this, 'Core');
    new PublicApiConstruct(this, 'PublicApi', {
      articlesTable: coreConstruct.articlesTable,
    });
  }
}
