import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

export interface ClientConstructProps {
  websitePath: string;
  domainName?: string;
  domainCertArn?: string;
}

export class ClientConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string, props: ClientConstructProps) {
    super(scope, id);

    // the bucket for the SPA
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // the cdn for distributing the SPA
    let domainCert: acm.ICertificate | undefined = undefined;
    let domainNames: string[] = [];
    if (props.domainCertArn !== undefined && props.domainName !== undefined) {
      domainCert = acm.Certificate.fromCertificateArn(this, 'DomainCert', props.domainCertArn);
      domainNames = [props.domainName];
    }
    const cdn = new cloudfront.Distribution(this, 'WebsiteCDN', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      comment: 'Website CDN for the news aggregator',
      domainNames: domainNames,
      certificate: domainCert,
      defaultRootObject: 'index.html',
      // errorResponses: [
      //   {
      //     httpStatus: 401,
      //     responseHttpStatus: 200,
      //     responsePagePath: '/index.html',
      //   },
      //   {
      //     httpStatus: 403,
      //     responseHttpStatus: 200,
      //     responsePagePath: '/index.html',
      //   },
      // ],
    });

    // deploy the last version of the website
    new s3deploy.BucketDeployment(this, 'Deployment', {
      destinationBucket: websiteBucket,
      sources: [s3deploy.Source.asset(props.websitePath)],
      retainOnDelete: false,
      prune: true,
      distribution: cdn,
    });

    // print the url to the SPA
    new cdk.CfnOutput(this, 'CDNDomain', {
      value: cdn.distributionDomainName,
      description: 'The domain for the news aggregator url',
    });
  }
}
