from typing import Dict

import pytest

from claps_api import __version__


def test_version():
    assert __version__ == '0.1.0'



@pytest.fixture
def real_event() -> Dict:
    return {
        "body": "{\"claps\": 1}",
        "headers": {
            "Accept": "application/json, */*;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Authorization": "Bearer eyJraWQiOiJubXA3R",
            "CloudFront-Forwarded-Proto": "https",
            "CloudFront-Is-Desktop-Viewer": "true",
            "CloudFront-Is-Mobile-Viewer": "false",
            "CloudFront-Is-SmartTV-Viewer": "false",
            "CloudFront-Is-Tablet-Viewer": "false",
            "CloudFront-Viewer-Country": "IT",
            "Content-Type": "application/json",
            "Host": "b23tyqugr2.execute-api.eu-central-1.amazonaws.com",
            "User-Agent": "HTTPie/2.4.0",
            "Via": "1.1 f65b97625821c62a5e2f78faedfe283b.cloudfront.net (CloudFront)",
            "X-Amz-Cf-Id": "ndfSZ8ZBRZAA_VQedadiJtuMAx3tMvbr6V7g2k137JGwKlOccAhVrA==",
            "X-Amzn-Trace-Id": "Root=1-608477b0-3006494c178718ff4185e6cc",
            "X-Forwarded-For": "123.45.123.45, 130.176.32.145",
            "X-Forwarded-Port": "443",
            "X-Forwarded-Proto": "https"
        },
        "httpMethod": "POST",
        "isBase64Encoded": False,
        "multiValueHeaders": {
            "Accept": [
                "application/json, */*;q=0.5"
            ],
            "Accept-Encoding": [
                "gzip, deflate"
            ],
            "Authorization": [
                "Bearer eyJraWQiOiJubXA3R"
            ],
            "CloudFront-Forwarded-Proto": [
                "https"
            ],
            "CloudFront-Is-Desktop-Viewer": [
                "true"
            ],
            "CloudFront-Is-Mobile-Viewer": [
                "false"
            ],
            "CloudFront-Is-SmartTV-Viewer": [
                "false"
            ],
            "CloudFront-Is-Tablet-Viewer": [
                "false"
            ],
            "CloudFront-Viewer-Country": [
                "IT"
            ],
            "Content-Type": [
                "application/json"
            ],
            "Host": [
                "b23tyqugr2.execute-api.eu-central-1.amazonaws.com"
            ],
            "User-Agent": [
                "HTTPie/2.4.0"
            ],
            "Via": [
                "1.1 f65b97625821c62a5e2f78faedfe283b.cloudfront.net (CloudFront)"
            ],
            "X-Amz-Cf-Id": [
                "ndfSZ8ZBRZAA_VQedadiJtuMAx3tMvbr6V7g2k137JGwKlOccAhVrA=="
            ],
            "X-Amzn-Trace-Id": [
                "Root=1-608477b0-3006494c178718ff4185e6cc"
            ],
            "X-Forwarded-For": [
                "123.45.123.45, 130.176.32.145"
            ],
            "X-Forwarded-Port": [
                "443"
            ],
            "X-Forwarded-Proto": [
                "https"
            ]
        },
        "multiValueQueryStringParameters": None,
        "path": "/articles/67fd1379-3c4a-41f8-a748-1e59ad74167f/claps",
        "pathParameters": {
            "articleId": "67fd1379-3c4a-41f8-a748-1e59ad74167f"
        },
        "queryStringParameters": None,
        "requestContext": {
            "accountId": "312948075487",
            "apiId": "b23tyqugr2",
            "authorizer": {
                "claims": {
                    "at_hash": "TdcARmpV8QF0kjSPWYKVFQ",
                    "aud": "32ge4vsd72ilpa4u1lnrpmobjq",
                    "auth_time": "1619293666",
                    "cognito:groups": "eu-central-1_hg8KLDUdE_Google",
                    "cognito:username": "Google_101995311548597891659",
                    "email": "n.cognome@miriade.it",
                    "email_verified": "true",
                    "exp": "Sat Apr 24 20:47:46 UTC 2021",
                    "iat": "Sat Apr 24 19:47:46 UTC 2021",
                    "identities": "{\"dateCreated\":\"1618389756258\",\"userId\":\"101995311548597891659\",\"providerName\":\"Google\",\"providerType\":\"Google\",\"issuer\":None,\"primary\":\"true\"}",
                    "iss": "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_aaaaaaaaaa",
                    "nonce": "X29qMzd6R0dyQkJYUlhIdjVUQ0pvdjNKNjNOLmJEVHFQWXhYQ1lyRFV5NUJT",
                    "sub": "444a0d3c-0103-46bc-a746-cf29a325b343",
                    "token_use": "id",
                }
            },
            "domainName": "b23tyqugr2.execute-api.eu-central-1.amazonaws.com",
            "domainPrefix": "b23tyqugr2",
            "extendedRequestId": "eTejoHWOFiAFcaA=",
            "httpMethod": "POST",
            "identity": {
                "accessKey": None,
                "accountId": None,
                "caller": None,
                "cognitoAuthenticationProvider": None,
                "cognitoAuthenticationType": None,
                "cognitoIdentityId": None,
                "cognitoIdentityPoolId": None,
                "principalOrgId": None,
                "sourceIp": "123.45.123.45",
                "user": None,
                "userAgent": "HTTPie/2.4.0",
                "userArn": None,
            },
            "path": "/api/articles/67fd1379-3c4a-41f8-a748-1e59ad74167f/claps",
            "protocol": "HTTP/1.1",
            "requestId": "236a1231-46a1-469f-837d-21064412f671",
            "requestTime": "24/Apr/2021:19:55:28 +0000",
            "requestTimeEpoch": 1619294128753,
            "resourceId": "yt73a4",
            "resourcePath": "/articles/{articleId}/claps",
            "stage": "api"
        },
        "resource": "/articles/{articleId}/claps",
        "stageVariables": None,
    }
