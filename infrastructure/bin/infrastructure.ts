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
});
