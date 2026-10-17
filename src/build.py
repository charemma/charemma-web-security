# /// script
# requires-python = ">=3.12"
# dependencies = ["jinja2==3.1.6", "markdown-it-py==4.2.0", "pyyaml==6.0.3"]
# ///
"""Render the static language versions of security.charemma.de into html/."""

import json
import shutil
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from urllib.parse import urlparse
from xml.sax.saxutils import escape

import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined
from markdown_it import MarkdownIt

SRC_DIR = Path(__file__).resolve().parent
OUT_DIR = SRC_DIR.parent / "html"
TEMPLATE_DIR = SRC_DIR / "templates"
I18N_DIR = SRC_DIR / "i18n"
SITE_CONFIG = SRC_DIR / "site.json"
TOPICS_FILE = SRC_DIR / "topics.json"
TOOLS_FILE = SRC_DIR / "tools.json"
ENGAGEMENT_FILE = SRC_DIR / "engagement.json"
ARTICLES_DIR = SRC_DIR / "articles"
NOT_FOUND_TEMPLATE = "404.html.j2"
ARTICLE_TEMPLATE = "article.html.j2"
X_DEFAULT = "x-default"
FRONT_MATTER_FENCE = "---\n"
REQUIRED_ARTICLE_FIELDS = ("lead", "updated")


@dataclass(frozen=True)
class Page:
    template: str
    path: str
    langs: tuple[str, ...] | None = None  # None: the page exists in every language
    slug: str | None = None  # set for article pages


@dataclass(frozen=True)
class Article:
    slug: str
    lang: str
    lead: str
    updated: str
    sources: list[dict]
    body_html: str


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def url_path(prefix: str, page_path: str) -> str:
    return "/" + prefix + page_path


def page_langs(site: dict, page: Page) -> list[dict]:
    return [lang for lang in site["languages"] if page.langs is None or lang["code"] in page.langs]


def x_default_lang(site: dict, langs: list[dict]) -> dict:
    """The default language when the page exists in it, otherwise the first language it exists in."""
    return next((lang for lang in langs if lang["code"] == site["default_lang"]), langs[0])


def alternates(site: dict, page: Page) -> list[dict]:
    base = site["base_url"]
    langs = page_langs(site, page)
    links = [{"hreflang": lang["code"], "href": base + url_path(lang["prefix"], page.path)} for lang in langs]
    default = x_default_lang(site, langs)
    links.append({"hreflang": X_DEFAULT, "href": base + url_path(default["prefix"], page.path)})
    return links


def lang_links(site: dict, page: Page) -> list[dict]:
    """Switcher entries; a language the page does not exist in leads to that language's knowledge overview."""
    available = {lang["code"] for lang in page_langs(site, page)}
    return [
        {
            "code": lang["code"],
            "label": lang["label"],
            "path": url_path(lang["prefix"], page.path if lang["code"] in available else site["knowledge"]["path"]),
        }
        for lang in site["languages"]
    ]


def localize(value, lang: str):
    """Pick the language variant of a {de, en, el} dict, pass plain values through."""
    return value[lang] if isinstance(value, dict) else value


def topic_href(site: dict, prefix: str, slug: str, published: bool) -> str:
    base = url_path(prefix, site["knowledge"]["path"])
    return f"{base}{slug}/" if published else f"{base}#{slug}"


def localized_topics(site: dict, topics: list[dict], articles: dict, lang: dict) -> list[dict]:
    published_slugs = articles[lang["code"]]
    return [
        {
            "id": t["id"],
            "group": t["group"],
            "slug": t["slug"],
            "published": t["slug"] in published_slugs,
            "href": topic_href(site, lang["prefix"], t["slug"], t["slug"] in published_slugs),
            **t[lang["code"]],
        }
        for t in topics
    ]


def parse_front_matter(text: str, path: Path) -> tuple[dict, str]:
    if not text.startswith(FRONT_MATTER_FENCE):
        raise ValueError(f"{path}: missing front matter")
    end = text.find("\n" + FRONT_MATTER_FENCE, len(FRONT_MATTER_FENCE))
    if end == -1:
        raise ValueError(f"{path}: unterminated front matter")
    meta = yaml.safe_load(text[len(FRONT_MATTER_FENCE) : end + 1]) or {}
    body = text[end + 1 + len(FRONT_MATTER_FENCE) :]
    return meta, body


def iso_date(value, path: Path) -> str:
    if isinstance(value, date):
        return value.isoformat()
    raise ValueError(f"{path}: 'updated' must be a date in YYYY-MM-DD form")


def load_articles(site: dict, topics: list[dict]) -> dict[str, dict[str, Article]]:
    """Published articles by language code and slug; drafts count as missing."""
    slugs = {t["slug"] for t in topics}
    articles: dict[str, dict[str, Article]] = {lang["code"]: {} for lang in site["languages"]}
    renderer = MarkdownIt("commonmark", {"html": False}).enable("table")
    for path in sorted(ARTICLES_DIR.glob("*.md")):
        slug, _, lang = path.stem.rpartition("-")
        if lang not in articles:
            raise ValueError(f"{path}: unknown language '{lang}'")
        if slug not in slugs:
            raise ValueError(f"{path}: no topic with slug '{slug}' in {TOPICS_FILE.name}")
        meta, body = parse_front_matter(path.read_text(encoding="utf-8"), path)
        if meta.get("draft") is True:
            continue
        missing = [field for field in REQUIRED_ARTICLE_FIELDS if field not in meta]
        if missing:
            raise ValueError(f"{path}: missing front matter fields {missing}")
        articles[lang][slug] = Article(
            slug=slug,
            lang=lang,
            lead=meta["lead"],
            updated=iso_date(meta["updated"], path),
            sources=meta.get("sources") or [],
            body_html=renderer.render(body),
        )
    return articles


def article_pages(site: dict, topics: list[dict], articles: dict) -> list[Page]:
    pages = []
    for t in topics:
        langs = tuple(lang["code"] for lang in site["languages"] if t["slug"] in articles[lang["code"]])
        if langs:
            pages.append(Page(ARTICLE_TEMPLATE, site["knowledge"]["path"] + t["slug"] + "/", langs, t["slug"]))
    return pages


def remove_stale_article_dirs(site: dict, topics: list[dict], articles: dict) -> None:
    """Drop rendered article pages whose article no longer exists or became a draft."""
    for lang in site["languages"]:
        for t in topics:
            if t["slug"] in articles[lang["code"]]:
                continue
            stale = OUT_DIR / lang["prefix"] / site["knowledge"]["path"] / t["slug"]
            if stale.is_dir():
                shutil.rmtree(stale)
                print(f"removed {stale.relative_to(OUT_DIR.parent)}")


def knowledge_groups(site: dict, texts: dict, topics: list[dict]) -> list[dict]:
    return [
        {"key": key, **texts["knowledge"]["groups"][key], "items": [t for t in topics if t["group"] == key]}
        for key in site["knowledge"]["groups"]
    ]


def featured_groups(site: dict, texts: dict, topics: list[dict]) -> list[dict]:
    by_id = {t["id"]: t for t in topics}
    return [
        {"key": key, **texts["knowledge"]["groups"][key], "items": [by_id[i] for i in ids]}
        for key, ids in site["knowledge"]["featured"].items()
    ]


def localized_tools(tools: list[dict], code: str) -> list[dict]:
    return [
        {"label": localize(g["label"], code), "hot": g.get("hot", False), "items": [localize(i, code) for i in g["items"]]}
        for g in tools
    ]


def engagement_data(engagement: dict, texts: dict) -> dict:
    t = texts["engagement"]
    steps = [
        {**step, "depth": t["depth"][i], "hit": t["hits"][i]}
        for i, step in enumerate(engagement["steps"])
    ]
    return {"steps": steps, "texts": {"cv": t["cv"], "work": t["work"], "meter_label": t["meter_label"]}}


def article_page_data(data: dict, texts: dict, lang: dict, page: Page, topics: list[dict]) -> dict:
    if page.slug is None:
        return {}
    topic = next(t for t in topics if t["slug"] == page.slug)
    return {
        "article": data["articles"][lang["code"]][page.slug],
        "topic": topic,
        "group_title": texts["knowledge"]["groups"][topic["group"]]["title"],
    }


def page_data(site: dict, data: dict, texts: dict, lang: dict, page: Page) -> dict:
    topics = localized_topics(site, data["topics"], data["articles"], lang)
    return {
        **article_page_data(data, texts, lang, page, topics),
        "tools": localized_tools(data["tools"], lang["code"]),
        "knowledge_groups": knowledge_groups(site, texts, topics),
        "featured_groups": featured_groups(site, texts, topics),
        "topic_count": len(topics),
        "engagement": engagement_data(data["engagement"], texts),
        "overview_href": url_path(lang["prefix"], site["knowledge"]["path"]),
    }


def write(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print(f"wrote {path.relative_to(OUT_DIR.parent)}")


def render_pages(env: Environment, site: dict, texts: dict, data: dict, pages: list[Page]) -> None:
    for page in pages:
        template = env.get_template(page.template)
        for lang in page_langs(site, page):
            html = template.render(
                **page_data(site, data, texts[lang["code"]], lang, page),
                site=site,
                site_host=urlparse(site["base_url"]).netloc,
                lang=lang["code"],
                t=texts[lang["code"]],
                canonical=site["base_url"] + url_path(lang["prefix"], page.path),
                alternates=alternates(site, page),
                lang_links=lang_links(site, page),
                home_href=url_path(lang["prefix"], ""),
            )
            write(OUT_DIR / lang["prefix"] / page.path / "index.html", html)


def render_not_found(env: Environment, site: dict, texts: dict) -> None:
    default = site["default_lang"]
    translations = [
        {"lang": lang["code"], "t": texts[lang["code"]], "home": url_path(lang["prefix"], "")}
        for lang in site["languages"]
    ]
    html = env.get_template(NOT_FOUND_TEMPLATE).render(
        site=site,
        lang=default,
        t=texts[default],
        canonical=None,
        alternates=[],
        lang_links=lang_links(site, Page(NOT_FOUND_TEMPLATE, "")),
        home_href="/",
        translations=translations,
    )
    write(OUT_DIR / "404.html", html)


def render_sitemap(site: dict, pages: list[Page]) -> None:
    entries = []
    for page in pages:
        links = alternates(site, page)
        for lang in page_langs(site, page):
            loc = site["base_url"] + url_path(lang["prefix"], page.path)
            alt_tags = "".join(
                f'\n    <xhtml:link rel="alternate" hreflang="{a["hreflang"]}" href="{escape(a["href"])}"/>'
                for a in links
            )
            entries.append(f"  <url>\n    <loc>{escape(loc)}</loc>{alt_tags}\n  </url>")
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
        'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + "\n".join(entries) + "\n</urlset>\n"
    )
    write(OUT_DIR / "sitemap.xml", xml)


def main() -> None:
    site = load_json(SITE_CONFIG)
    texts = {lang["code"]: load_json(I18N_DIR / f"{lang['code']}.json") for lang in site["languages"]}
    topics = load_json(TOPICS_FILE)
    articles = load_articles(site, topics)
    pages = [Page(**p) for p in site["pages"]] + article_pages(site, topics, articles)
    data = {
        "topics": topics,
        "articles": articles,
        "tools": load_json(TOOLS_FILE),
        "engagement": load_json(ENGAGEMENT_FILE),
    }
    remove_stale_article_dirs(site, topics, articles)
    env = Environment(
        loader=FileSystemLoader(TEMPLATE_DIR),
        autoescape=True,
        undefined=StrictUndefined,
        keep_trailing_newline=True,
    )
    render_pages(env, site, texts, data, pages)
    render_not_found(env, site, texts)
    render_sitemap(site, pages)


if __name__ == "__main__":
    main()
