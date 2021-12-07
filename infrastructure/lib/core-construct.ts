import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';

export class CoreConstruct extends cdk.Construct {
  readonly articlesTable: dynamodb.Table;
  readonly clapsFn: lambda.Alias;
  readonly addArticleFn: lambda.Alias;
  readonly googleChatFn: lambda.Alias;

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
    articlesTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: {
        name: 'domain',
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

    const clapsFn = new lambda.Function(this, 'ClapsFn', {
      code: new lambda.AssetCode('../claps-api/claps_api'),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      description: 'Function to handle Clap API',
      logRetention: logs.RetentionDays.TWO_WEEKS,
      tracing: lambda.Tracing.PASS_THROUGH,
      environment: {
        articleTable: articlesTable.tableName,
      },
    });
    const clapsFnLive = new lambda.Alias(clapsFn, 'Live', {
      aliasName: 'live',
      version: clapsFn.currentVersion,
    });
    articlesTable.grantReadWriteData(clapsFn);

    const addArticleFn = new lambda.Function(this, 'AddArticleFn', {
      code: new lambda.AssetCode('../articlefn/articlefn'),
      handler: 'add.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      description: 'Function to add an article',
      logRetention: logs.RetentionDays.TWO_WEEKS,
      tracing: lambda.Tracing.PASS_THROUGH,
      environment: {
        articleTable: articlesTable.tableName,
      },
    });
    const addArticleFnLive = new lambda.Alias(addArticleFn, 'Live', {
      aliasName: 'live',
      version: addArticleFn.currentVersion,
    });
    articlesTable.grantReadWriteData(addArticleFn);

    const googleChatFn = new lambda.Function(this, 'GoogleChatFn', {
      code: new lambda.AssetCode('../google-chat/google_chat'),
      handler: 'main.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      description: 'Function to add handle google chat bot requests',
      logRetention: logs.RetentionDays.TWO_WEEKS,
      tracing: lambda.Tracing.PASS_THROUGH,
      environment: {
        addArticleFn: addArticleFnLive.functionArn,
      },
    });
    const googleChatFnLive = new lambda.Alias(googleChatFn, 'Live', {
      aliasName: 'live',
      version: googleChatFn.currentVersion,
    });
    addArticleFnLive.grantInvoke(googleChatFn);

    this.articlesTable = articlesTable;
    this.clapsFn = clapsFnLive;
    this.addArticleFn = addArticleFnLive;
    this.googleChatFn = googleChatFnLive;
  }
}
