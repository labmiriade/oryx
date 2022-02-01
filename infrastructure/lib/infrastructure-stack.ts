import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { ClientConstruct, ClientConstructProps } from './client-construct';
import { PublicApiConstruct } from './public-api-construct';
import { CoreConstruct } from './core-construct';
import { AnalyticsConstruct } from './analytics-construct';

export interface InfrastructurePropsStack extends StackProps {
  userPoolArn: string;
  webApp: ClientConstructProps;
}

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: InfrastructurePropsStack) {
    super(scope, id, props);

    // create the client infrastructure
    new ClientConstruct(this, 'Client', props.webApp);
    const coreConstruct = new CoreConstruct(this, 'Core');
    const userPool = cognito.UserPool.fromUserPoolArn(this, 'UserPool', props?.userPoolArn);
    new PublicApiConstruct(this, 'PublicApi', {
      articlesTable: coreConstruct.articlesTable,
      userPool,
      clapsFn: coreConstruct.clapsFn,
      addArticleFn: coreConstruct.addArticleFn,
      googleChatFn: coreConstruct.googleChatFn,
    });
    new AnalyticsConstruct(this, 'Analytics', {});
  }
}
