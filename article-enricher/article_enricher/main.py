import traceback

from boto3.dynamodb.types import TypeDeserializer

import scraper
from bootstrap import add_bootstrap, Bootstrap

deserializer = TypeDeserializer()


def handler(event, context):
    count = 0
    for record in event["Records"]:
        # Get the key attributes
        sk = record["dynamodb"]["Keys"]["sk"]["S"]

        try:
            if sk == "ART":
                count += process_article(record)
        except Exception as error:
            print(f"error processing {record=} {error=}")
            traceback.print_exc()

    pass


@add_bootstrap
def process_article(record, b: Bootstrap) -> int:
    if record["eventName"] == "REMOVE":
        # item has been deleted, nothing to do
        return 0
    else:
        record = record["dynamodb"]["NewImage"]
        # should process only if it has never been enriched
        should_process = record.get("lastEnriched") is None
        if should_process:
            link = record["link"]["S"]
            art = scraper.enrich_article(link=link)
            record["title"] = {"S": art.title}
            record["tags"] = {"SS": list(art.tags)} if len(art.tags) > 0 else {"NULL": True}
            record["lastEnriched"] = {"S": b.exec_time}
            print(f"save updated {record=}")
            b.dynamodb.put_item(
                TableName=b.table_name,
                Item=record,
            )
        else:
            print(f"article {record=} is already enriched")
    return 1
