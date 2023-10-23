import { Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib';
import * as Infrastructure from '../lib/infrastructure-stack';

test('Empty Stack', () => {
  const app = new App();
  // WHEN
  const stack = new Infrastructure.InfrastructureStack(app, 'MyTestStack', {
    userPoolArn: 'mytestarn',
    webApp: {
      websitePath: 'mucca.example.org',
    },
  });
  Template.fromStack(stack);
});
