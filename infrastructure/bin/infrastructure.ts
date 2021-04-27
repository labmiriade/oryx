#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const dev = new cdk.App();
new InfrastructureStack(dev, 'NewsAggregator', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-central-1' },
  tags: {
    Project: 'OryxNewsAggregator',
    Progetto: 'OryxNewsAggregator',
    Referente: 't.panozzo',
  },
  userPoolArn: 'arn:aws:cognito-idp:eu-central-1:312948075487:userpool/eu-central-1_hg8KLDUdE',
  webApp: {
    websitePath: '../website/build',
    domainName: 'oryx.labmiriade.it',
    domainCertArn: 'arn:aws:acm:us-east-1:312948075487:certificate/d1e49ef9-10b6-4e8c-83b2-f26d037fc19d',
  },
});
