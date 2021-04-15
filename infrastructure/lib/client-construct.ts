import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";

export class ClientConstruct extends cdk.Construct {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    // the bucket for the SPA
    const websiteBucket = new s3.Bucket(this, "WebsiteBucket", {
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // the cdn for distributing the SPA
    const cdn = new cloudfront.Distribution(this, "WebsiteCDN", {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket),
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      comment: "Website CDN for the news aggregator",
      defaultRootObject: "/index.html",
      errorResponses: [
        {
          httpStatus: 401,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    // print the url to the SPA
    new cdk.CfnOutput(this, "CDNDomain", {
      value: cdn.distributionDomainName,
      description: "The domain for the news aggregator url",
    });
  }
}
