from newspaper import Article


def enrich_article(link: str) -> Article:
    article = Article(link)
    article.download()
    article.parse()
    # article.nlp()
    return article
