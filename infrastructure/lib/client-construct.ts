import { Construct } from 'constructs';
import { CfnOutput, DockerImage, RemovalPolicy } from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';

export interface ClientConstructProps {
  websitePath: string;
  domainName?: string;
  domainCertArn?: string;
}

export class ClientConstruct extends Construct {
  domainName: string;

  constructor(scope: Construct, id: string, props: ClientConstructProps) {
    super(scope, id);

    // the bucket for the SPA
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      autoDeleteObjects: true,
      publicReadAccess: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
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
        origin: new origins.HttpOrigin(websiteBucket.bucketWebsiteDomainName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          httpPort: 80,
        }),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      comment: 'Website CDN for the news aggregator',
      domainNames: domainNames,
      certificate: domainCert,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2,
    });

    // deploy the last version of the website
    new s3deploy.BucketDeployment(this, 'Deployment', {
      destinationBucket: websiteBucket,
      sources: [
        s3deploy.Source.asset(props.websitePath, {
          bundling: {
            image: DockerImage.fromRegistry('node:14-alpine'),
            command: ['sh', 'cdk-build.sh', 'build'],
            user: 'root',
          },
        }),
      ],
      retainOnDelete: false,
      prune: true,
      distribution: cdn,
    });

    // print the url to the SPA
    new CfnOutput(this, 'CDNDomain', {
      value: cdn.distributionDomainName,
      description: 'The domain for the news aggregator url',
    });

    this.domainName = props.domainName ? props.domainName : cdn.domainName;
  }
}
