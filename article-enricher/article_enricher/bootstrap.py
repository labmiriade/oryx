import datetime
from functools import wraps
import os

import boto3


class Bootstrap:
    def __init__(
        self,
        /,
        *,
        table_name: str,
        table,
        dynamodb,
        exec_time: str,
    ) -> None:
        super().__init__()
        self.exec_time = exec_time
        self.dynamodb = dynamodb
        self.table = table
        self.table_name = table_name


def add_bootstrap(f):
    table_name = os.environ["articleTable"]
    dynamodb_res = boto3.resource("dynamodb")
    table = dynamodb_res.Table(table_name)
    dynamodb = boto3.client("dynamodb")
    exec_time = datetime.datetime.utcnow().isoformat()
    b = Bootstrap(
        table_name=table_name, table=table, dynamodb=dynamodb, exec_time=exec_time
    )

    @wraps(f)
    def wrapper(*args, **kwargs):
        return f(*args, b=b, **kwargs)

    return wrapper
