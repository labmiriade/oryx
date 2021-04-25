import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import { ClientConstruct } from './client-construct';
import { PublicApiConstruct } from './public-api-construct';
import { CoreConstruct } from './core-construct';

export interface InfrastructurePropsStack extends cdk.StackProps {
  userPoolArn: string;
}

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: InfrastructurePropsStack) {
    super(scope, id, props);

    // create the client infrastructure
    // new ClientConstruct(this, 'Client');
    const coreConstruct = new CoreConstruct(this, 'Core');
    const userPool = cognito.UserPool.fromUserPoolArn(this, 'UserPool', props?.userPoolArn);
    new PublicApiConstruct(this, 'PublicApi', {
      articlesTable: coreConstruct.articlesTable,
      userPool,
      clapsFn: coreConstruct.clapsFn,
      addArticleFn: coreConstruct.addArticleFn,
      googleChatFn: coreConstruct.googleChatFn,
    });
  }
}
