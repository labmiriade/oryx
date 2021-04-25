import datetime
import os
import uuid
from functools import wraps
from typing import Dict, Any

import boto3

ARTICLE_SK = 'ART'
ARTICLE_TYPE = 'ART'

Article = Dict[str, Any]


def add_articletable(f):
    dynamores = boto3.resource('dynamodb')
    tablename = os.environ['articleTable']
    table = dynamores.Table(tablename)

    @wraps(f)
    def wrapper(*args, **kwargs):
        return f(*args, articletable=table, **kwargs)

    return wrapper


@add_articletable
def handler(event, context, articletable) -> Article:
    article = _article_from_input(event['article'])
    _put_article(article, articletable)
    return article


def _article_from_input(a: Dict[str, Any]) -> Article:
    now = datetime.datetime.utcnow().isoformat()
    aux = {
        "pk": a.get('id') or str(uuid.uuid4()),
        "sk": ARTICLE_SK,
        "link": a['link'],
        "title": a.get('title') or a['link'].split('://')[1],
        "referrer": a['referrer'],
        "enriched": False,
        "claps": a.get('claps') or 0,
        "clappers": a.get('clappers') or 0,
        "date": now,
        "gsi1sk": now,
        "type": ARTICLE_TYPE,
    }
    if (tags := a.get('tags')) is not None:
        aux['tags'] = tags
    return aux


def _put_article(a: Article, table):
    table.put_item(
        Item=a,
    )
