import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';

export class CoreConstruct extends cdk.Construct {
  readonly articlesTable: dynamodb.Table;

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    // the main table for the project
    const articlesTable = new dynamodb.Table(this, 'ArticlesTable', {
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
    });

    // add indexes
    articlesTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'type',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'gsi1sk',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const articleEnricher = new lambda.Function(this, 'Enricher', {
      // code: new lambda.AssetCode('../article-enricher/article_enricher', {}),
      code: new lambda.InlineCode('# to be implemented'),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      environment: {
        articleTable: articlesTable.tableName,
      },
      logRetention: logs.RetentionDays.TWO_WEEKS,
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      tracing: lambda.Tracing.ACTIVE,
    });
    articlesTable.grantReadWriteData(articleEnricher);
    new lambda.Alias(articleEnricher, 'live', {
      aliasName: 'live',
      version: articleEnricher.currentVersion,
    });
    articleEnricher.addEventSource(
      new DynamoEventSource(articlesTable, {
        startingPosition: lambda.StartingPosition.TRIM_HORIZON,
        batchSize: 5,
        bisectBatchOnError: true,
        retryAttempts: 3,
      }),
    );

    this.articlesTable = articlesTable;
  }
}
