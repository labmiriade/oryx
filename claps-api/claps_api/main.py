from datetime import datetime, timezone
import json
import os
from functools import wraps
from typing import TypedDict, Dict, Optional

import boto3


class APIResponse(TypedDict):
    statusCode: int
    body: str
    headers: Dict[str, str]


class Bootstrap:
    def __init__(self, tablename: str, table):
        self.tablename = tablename
        self.table = table


def add_bootstrap(f):
    dynamores = boto3.resource('dynamodb')
    tablename = os.environ['articleTable']
    table = dynamores.Table(tablename)
    b = Bootstrap(tablename, table)

    @wraps(f)
    def wrapper(*args, **kwargs):
        return f(*args, b=b, **kwargs)

    return wrapper


@add_bootstrap
def handler(event, context, b: Bootstrap) -> APIResponse:
    # fetch the article
    print(f'{event=}')
    articleid = event['pathParameters']['articleId']
    article = get_article(articleid, b)
    body = json.loads(event['body'])

    if article is None:
        aux = {
            'message': f'article {articleid} not found'
        }
        status = 404
    else:
        claps = body['claps']
        caller = event['requestContext']['authorizer']['claims']['email']
        # insert claps for the user
        res = b.table.put_item(
            Item={
                "pk": articleid,
                "sk": f'CLAPS#{caller}',
                "claps": claps,
                "datetime": datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
            },
            ReturnValues="ALL_OLD",
        )
        # get how many more claps/clappers there are (the user may have clapped before)
        old = res.get('Attributes')
        if old is None:
            deltaclaps = claps
            deltaclappers = 1 if claps > 0 else 0
            status = 201
        else:
            deltaclaps = claps - old['claps']
            deltaclappers = -1 if old['claps'] > 0 == claps else 0
            status = 200
        b.table.update_item(
            Key={
                "pk": articleid,
                "sk": 'ART',
            },
            UpdateExpression='SET #claps = #claps + :deltaclaps, #clappers = #clappers + :deltaclappers',
            ExpressionAttributeNames={
                '#claps': 'claps',
                '#clappers': 'clappers',
            },
            ExpressionAttributeValues={
                ':deltaclaps': deltaclaps,
                ':deltaclappers': deltaclappers,
            },
        )
        aux = {
            "caller": caller,
            "claps": claps,
        }

    return APIResponse(
        statusCode=status,
        body=json.dumps(aux),
        headers={
            'method.response.header.Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
            'method.response.header.Access-Control-Allow-Methods': '*',
            'method.response.header.Access-Control-Allow-Origin': '*',
        }
    )


def get_article(id: str, b: Bootstrap) -> Optional[Dict]:
    return b.table.get_item(
        Key={
            'pk': id,
            'sk': 'ART',
        },
        ConsistentRead=False,
    ).get('Item')
