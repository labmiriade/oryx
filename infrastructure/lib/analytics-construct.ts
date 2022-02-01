import { Construct } from 'constructs';

import { Stack } from 'aws-cdk-lib';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface AnalyticsConstructProps {}

export class AnalyticsConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AnalyticsConstructProps) {
    super(scope, id);

    const pinpointProject = new pinpoint.CfnApp(this, 'MuccaProject', {
      name: `${Stack.of(this).stackName}-MuccaProject`,
    });

    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
    });

    const pinpointAccessPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          resources: [`${pinpointProject.attrArn}/*`],
          actions: ['mobiletargeting:PutEvents'],
        }),
        new iam.PolicyStatement({
          resources: [`${pinpointProject.attrArn}/*`],
          actions: ['mobiletargeting:UpdateEndpoint'],
        }),
        new iam.PolicyStatement({
          resources: ['*'],
          actions: ['mobiletargeting:PutEvents'],
        }),
      ],
    });

    const identityPoolRole = new iam.Role(this, 'IdentityPoolRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      inlinePolicies: {
        allowAccess: pinpointAccessPolicy,
      },
    });

    const identityPoolRoles = new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoles', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: identityPoolRole.roleArn,
        unauthenticated: identityPoolRole.roleArn,
      },
    });
  }
}
