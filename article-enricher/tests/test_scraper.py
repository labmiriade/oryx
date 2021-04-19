import pytest

from article_enricher import scraper


@pytest.mark.parametrize(
    ["link"],
    [
        (
            "https://docs.github.com/en/packages/guides/migrating-to-github-container-registry-for-docker-images",
        ),
        ("https://www.stavros.io/posts/keyyyyyyyys/",),
        ("https://www.brandons.me/blog/why-rust-strings-seem-hard",),
    ],
)
def test_scraper(link):
    # WHEN
    article = scraper.enrich_article(link)
    print(f"{article=}")
    assert len(article.title) > 2
