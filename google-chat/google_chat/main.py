import json
import os
import re
from functools import wraps
from typing import TypedDict, Dict, Any, Optional

import boto3

BASE_URL = 'https://b23tyqugr2.execute-api.eu-central-1.amazonaws.com/api/articles/{articleid}'


class Article(TypedDict):
    link: str
    referrer: str


class NoLinkException(Exception):
    pass


class InGroupException(Exception):
    pass


class NotAMessageException(Exception):
    pass


class ErrorSavingLink(Exception):

    def __init__(self, *args: object, err: str, res: Dict) -> None:
        super().__init__(*args)
        self.err = err
        self.res = res


def add_lambda(f):
    lmbda = boto3.client('lambda')

    @wraps(f)
    def wrapper(*args, **kwargs):
        return f(*args, lmbda=lmbda, **kwargs)

    return wrapper


@add_lambda
def handler(event, context, lmbda):
    print(f'{event=}')
    req_body = json.loads(event['body'])
    try:
        article = _article_from_event(req_body)
        _add_article(article, lmbda)
        body = {
            "text": "Caricato! Grazie mille 🐮",
        }
    except NotAMessageException:
        body = {
            "text": "Ciao, scusami ma non capisco questo messaggio :(",
        }
    except InGroupException:
        body = {
            "text": "Ciao, mi dispiace ma non sono ancora abilitata a funzionare nei gruppi 🐮",
        }
    except NoLinkException:
        body = {
            "text": "Ciao, mandami pure il link che vuoi caricare su Mucca, il news aggregator di Miriade! 🐮",
        }
    except ErrorSavingLink:
        body = {
            "text": "Ops, si è verificato un errore caricando il link 🐮"
        }
    return {
        'statusCode': 200,
        'body': json.dumps(body),
    }


def _add_article(a: Article, lmbda) -> (Optional[str], Dict):
    payload = json.dumps({"article": a}).encode('utf-8')
    res = lmbda.invoke(
        FunctionName=os.environ['addArticleFn'],
        InvocationType='RequestResponse',
        Payload=payload,
    )
    print(f'add_article lambda {res=}')
    res_payload = res['Payload'].read().decode("utf-8")
    print(f'add_article lambda {res_payload=}')
    res_body = json.loads(res_payload)
    err = res.get('FunctionError')
    if err is not None:
        raise ErrorSavingLink(err=err, res=res_body)
    return res_body


link_re = r'(https?://[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9\(\)]{1,6}\b[-a-zA-Z0-9\(\)@:%_+.~#?/&=]*)'


def _article_from_event(event: Dict[str, Any]) -> Article:
    if event['type'] != 'MESSAGE':
        print(f'event {event=} is not a message')
        raise NotAMessageException()
    elif not event['space']['singleUserBotDm']:
        print(f'event {event=} refers to a group chat, should ignore for now')
        raise InGroupException()

    # get message
    message = event['message']['text']
    referrer = event['message']['sender']['email']
    match = re.search(link_re, message)
    if match is None or len(match.groups('1')) < 1:
        raise NoLinkException()
    return Article(
        link=match.groups('1')[0],
        referrer=referrer,
    )
