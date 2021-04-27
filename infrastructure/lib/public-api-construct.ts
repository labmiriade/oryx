import * as cdk from '@aws-cdk/core';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

export interface PublicApiConstructProps {
  /**
   * The origins to allow
   * @default '*'
   */
  corsOrigins?: string[];
  articlesTable: dynamodb.Table;
  userPool: cognito.IUserPool;
  clapsFn: lambda.Alias;
  addArticleFn: lambda.Alias;
  googleChatFn: lambda.Alias;
}

export class PublicApiConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: PublicApiConstructProps) {
    super(scope, id);

    // create the client infrastructure
    const api = new apigateway.RestApi(this, 'Gateway', {
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
      defaultCorsPreflightOptions: {
        allowOrigins: props?.corsOrigins ?? apigateway.Cors.ALL_ORIGINS,
      },
      deployOptions: {
        description: 'Public API for the news aggregator',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        stageName: 'api',
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 50,
        tracingEnabled: true,
      },
      description: 'Oryx News Aggregator Public REST Gateway',
    });

    const cognitoAuthz = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthz', {
      cognitoUserPools: [props.userPool],
    });

    const fullValidator = api.addRequestValidator('BodyValidator', {
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    // ruolo utilizzato dalle integrazioni che fanno query (sola lettura) a dataTable
    const articlesTableReadWriteRole = new iam.Role(this, 'TableQueryRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    });
    props.articlesTable.grantReadWriteData(articlesTableReadWriteRole);

    // define useful constants for enabling CORS
    // const corsIntegResponseParameters = undefined;
    const corsIntegResponseParameters = {
      'method.response.header.Access-Control-Allow-Headers': `'Content-Type,X-Amz-Date,Authorization,X-Api-Key'`,
      'method.response.header.Access-Control-Allow-Methods': `'*'`,
      'method.response.header.Access-Control-Allow-Origin': `'*'`,
    };
    const corsMethodResponseParameters = {
      'method.response.header.Access-Control-Allow-Headers': true,
      'method.response.header.Access-Control-Allow-Methods': true,
      'method.response.header.Access-Control-Allow-Credentials': true,
      'method.response.header.Access-Control-Allow-Origin': true,
    };

    // create the lambda to answer to public apis
    const articles = api.root.addResource('articles');
    const getArticles = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'Query',
      options: {
        credentialsRole: articlesTableReadWriteRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': articleRequestTemplate(props.articlesTable.tableName),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': articlesResponseTemplate,
            },
            responseParameters: {
              'method.response.header.Access-Control-Allow-Headers': `'Content-Type,X-Amz-Date,Authorization,X-Api-Key'`,
              'method.response.header.Access-Control-Allow-Methods': `'*'`,
              'method.response.header.Access-Control-Allow-Origin': `'*'`,
            },
          },
        ],
      },
    });
    articles.addMethod('GET', getArticles, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
      ],
    });

    // POST /articles
    const postArticle = new apigateway.LambdaIntegration(props.addArticleFn, {
      proxy: false,
      requestTemplates: {
        'application/json': JSON.stringify({
          article: {
            id: '$context.requestId',
            link: "$input.path('$.link')",
            referrer: '$context.authorizer.claims.email',
          },
        }),
      },
      integrationResponses: [
        {
          statusCode: '201',
          responseTemplates: {
            'application/json': postArticleResponseTemplate,
          },
          responseParameters: corsIntegResponseParameters,
        },
      ],
    });
    const requestArticleModel = api.addModel('ReqArticle', {
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          link: {
            type: apigateway.JsonSchemaType.STRING,
            pattern: 'https?://[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_+.~#?/&=]*)',
          },
        },
        additionalProperties: false,
      },
    });
    articles.addMethod('POST', postArticle, {
      methodResponses: [
        {
          statusCode: '201',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
      ],
      requestModels: {
        'application/json': requestArticleModel,
      },
      requestValidator: fullValidator,
      authorizer: cognitoAuthz,
    });

    // GET /articles/{articleId}
    const article = articles.addResource('{articleId}');
    const getArticle = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: articlesTableReadWriteRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': JSON.stringify({
            TableName: props.articlesTable.tableName,
            ConsistentRead: false,
            Key: {
              pk: { S: "$input.params('articleId')" },
              sk: { S: 'ART' },
            },
          }),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': articleResponseTemplate,
            },
            responseParameters: corsIntegResponseParameters,
          },
          {
            statusCode: '404',
            selectionPattern: '404',
            responseTemplates: {
              'application/json': JSON.stringify({
                message: `article "$input.params('articleId')" not found`,
              }),
            },
            responseParameters: corsIntegResponseParameters,
          },
        ],
      },
    });
    article.addMethod('GET', getArticle, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
        {
          statusCode: '404',
          responseModels: {
            'application/json': apigateway.Model.ERROR_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
      ],
    });

    // DELETE /articles/{articleId}
    const deleteArticle = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'DeleteItem',
      options: {
        credentialsRole: articlesTableReadWriteRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': JSON.stringify({
            TableName: props.articlesTable.tableName,
            Key: {
              pk: { S: "$input.params('articleId')" },
              sk: { S: 'ART' },
            },
            ConditionExpression: '#referrer = :caller',
            ExpressionAttributeNames: {
              '#referrer': 'referrer',
            },
            ExpressionAttributeValues: {
              ':caller': { S: '$context.authorizer.claims.email' },
            },
          }),
        },
        integrationResponses: [
          {
            statusCode: '204',
            responseTemplates: {
              'application/json': '',
            },
            responseParameters: corsIntegResponseParameters,
          },
        ],
      },
    });
    article.addMethod('DELETE', deleteArticle, {
      methodResponses: [
        {
          statusCode: '204',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
        {
          statusCode: '403',
          responseModels: {
            'application/json': apigateway.Model.ERROR_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
      ],
      authorizer: cognitoAuthz,
    });

    // POST /articles/{articleId}/pings
    const pings = article.addResource('pings');
    const pingInteg = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'UpdateItem',
      options: {
        credentialsRole: articlesTableReadWriteRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'text/ping': JSON.stringify({
            TableName: props.articlesTable.tableName,
            Key: {
              pk: { S: "$input.params('articleId')" },
              sk: { S: 'ART' },
            },
            ExpressionAttributeNames: {
              '#pings': 'pings',
            },
            ExpressionAttributeValues: {
              ':one': { N: '1' },
            },
            UpdateExpression: 'SET #pings = #pings + :one',
          }),
        },
        integrationResponses: [
          {
            statusCode: '204',
            responseTemplates: {
              'application/json': '',
            },
            responseParameters: corsIntegResponseParameters,
          },
        ],
      },
    });
    pings.addMethod('POST', pingInteg, {
      methodResponses: [
        {
          statusCode: '204',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
      ],
    });

    // PUT /articles/{articleId}/claps
    const claps = article.addResource('claps');
    const putClaps = new apigateway.LambdaIntegration(props.clapsFn, {
      // requestParameters: corsIntegResponseParameters,
    });
    const requestClapsModel = api.addModel('ReqClaps', {
      schema: {
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          claps: {
            type: apigateway.JsonSchemaType.NUMBER,
            minimum: 0,
            maximum: 100,
          },
        },
        additionalProperties: false,
      },
    });
    claps.addMethod('PUT', putClaps, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
      ],
      requestModels: {
        'application/json': requestClapsModel,
      },
      requestValidator: fullValidator,
      authorizer: cognitoAuthz,
    });

    // GET /articles/{articleId}/claps
    const getClaps = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'GetItem',
      options: {
        credentialsRole: articlesTableReadWriteRole,
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          'application/json': JSON.stringify({
            TableName: props.articlesTable.tableName,
            ConsistentRead: false,
            Key: {
              pk: { S: "$input.params('articleId')" },
              sk: { S: 'CLAPS#$context.authorizer.claims.email' },
            },
          }),
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': clapsResponseTemplate,
            },
            responseParameters: corsIntegResponseParameters,
          },
        ],
      },
    });
    claps.addMethod('GET', getClaps, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
          responseParameters: corsMethodResponseParameters,
        },
      ],
      authorizer: cognitoAuthz,
    });

    // handle chat requests
    const chats = api.root.addResource('chats');
    const google = chats.addResource('google');
    const googleChatInteg = new apigateway.LambdaIntegration(props.googleChatFn);
    google.addMethod('POST', googleChatInteg);
  }
}

function articleRequestTemplate(tableName: string): string {
  return `
#set( $nextToken = $input.params('nextToken') )
#set( $limit = $input.params('limit') )
#if( "$limit" == "" || $limit.matches("^\\d+$") || $limit < 0 || $limit > 30 )
  #set( $limit = 30 )
#end
{
  "TableName":"NewsAggregator-CoreArticlesTableC749F523-4U6EAER1HQ8P",
  "IndexName":"GSI1",
  "KeyConditionExpression":"#type = :art",
  "ExpressionAttributeNames":{"#type":"type"},
  "ExpressionAttributeValues":{":art":{"S":"ART"}},
  "ScanIndexForward":false,
#if( $nextToken != "" )
  "ExclusiveStartKey": $util.base64Decode($nextToken),
#end
  "Limit": $limit
}  
`;
}

const articlesResponseTemplate = `
#set( $items = $input.path('$.Items') )
#set( $lastKey = $input.json('$.LastEvaluatedKey') )
{
  #if( $lastKey != "" && $lastKey != '""')
  "nextToken": "$util.base64Encode($lastKey)",
#end
  "items":[
    #foreach($item in $items)
    {
      "id": "$item.pk.S",
      "title": #if($item.title.S == '') "$item.link.S" #else "$item.title.S" #end,
      "link": "$item.link.S",
      "tags": #if($item.tags.SS == '') [] #else $item.tags.SS #end,
      "claps": $item.claps.N,
      "clappers": $item.clappers.N,
      "referrer": "$item.referrer.S",
      "date": "$item.date.S"
    }#if($foreach.hasNext),#end
    #end
  ]
}
`;

const articleResponseTemplate = `
#set( $item = $input.path('$.Item') )
#if ( "$item" == "" )
#set( $context.responseOverride.status = 404 )
{
  "message": "article $input.params('articleId') not found"
}
#else
{
  "id": "$item.pk.S",
  "title": #if($item.title.S == '') "$item.link.S" #else "$item.title.S" #end,
  "link": "$item.link.S",
  "tags": #if($item.tags.SS == '') [] #else $item.tags.SS #end,
  "claps": $item.claps.N,
  "clappers": $item.clappers.N,
  "referrer": "$item.referrer.S",
  "date": "$item.date.S"
}
#end
`;

const postArticleResponseTemplate = `
#set( $context.responseOverride.header.Location = "/articles/$context.requestId" )
$input.body
`;

const clapsResponseTemplate = `
#set( $item = $input.path('$.Item') )
#if ( "$item" == "" )
{
  "id": "$input.params('articleId')",
  "caller": "$context.authorizer.claims.email",
  "claps": 0
}
#else
{
  "id": "$input.params('articleId')",
  "caller": "$context.authorizer.claims.email",
  "claps": $item.claps.N,
  "date": "$item.datetime.S"
}
#end
`;
