import { Construct } from 'constructs';

import { Stack } from 'aws-cdk-lib';
import * as pinpoint from 'aws-cdk-lib/aws-pinpoint';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as rum from 'aws-cdk-lib/aws-rum';

export interface AnalyticsConstructProps {
  domainName?: string;
}

export class AnalyticsConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AnalyticsConstructProps) {
    super(scope, id);

    // IDENTITY POOL
    const identityPool = new cognito.CfnIdentityPool(this, 'IdentityPool', {
      allowUnauthenticatedIdentities: true,
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
      inlinePolicies: {},
    });

    const identityPoolRoles = new cognito.CfnIdentityPoolRoleAttachment(this, 'IdentityPoolRoles', {
      identityPoolId: identityPool.ref,
      roles: {
        authenticated: identityPoolRole.roleArn,
        unauthenticated: identityPoolRole.roleArn,
      },
    });

    // PINPOINT
    const pinpointProject = new pinpoint.CfnApp(this, 'MuccaProject', {
      name: `${Stack.of(this).stackName}-MuccaProject`,
    });

    const pinpointPolicy = new iam.Policy(this, 'PinpointPolicy', {
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
    identityPoolRole.attachInlinePolicy(pinpointPolicy);

    // RUM
    if (props.domainName) {
      const appMonitor = new rum.CfnAppMonitor(this, 'MuccaMonitor', {
        domain: props.domainName,
        name: `${Stack.of(this).stackName}-MuccaMonitor`,
        appMonitorConfiguration: {
          allowCookies: true,
          enableXRay: true,
          identityPoolId: identityPool.ref,
          guestRoleArn: identityPoolRole.roleArn,
          sessionSampleRate: 1,
          telemetries: ['errors', 'performance', 'http'],
        },
        cwLogEnabled: true,
      });

      const rumPolicy = new iam.Policy(this, 'RumPolicy', {
        statements: [
          new iam.PolicyStatement({
            resources: [`arn:aws:rum:${Stack.of(this).region}:${Stack.of(this).account}:appmonitor/${appMonitor.ref}`],
            actions: ['rum:PutRumEvents'],
          }),
        ],
      });
      identityPoolRole.attachInlinePolicy(rumPolicy);
    }
  }
}
