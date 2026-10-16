# /// script
# requires-python = ">=3.12"
# dependencies = ["jinja2==3.1.6"]
# ///
"""Render the static language versions of security.charemma.de into html/."""

import json
from dataclasses import dataclass
from pathlib import Path
from xml.sax.saxutils import escape

from jinja2 import Environment, FileSystemLoader, StrictUndefined

SRC_DIR = Path(__file__).resolve().parent
OUT_DIR = SRC_DIR.parent / "html"
TEMPLATE_DIR = SRC_DIR / "templates"
I18N_DIR = SRC_DIR / "i18n"
SITE_CONFIG = SRC_DIR / "site.json"
TOPICS_FILE = SRC_DIR / "topics.json"
TOOLS_FILE = SRC_DIR / "tools.json"
ENGAGEMENT_FILE = SRC_DIR / "engagement.json"
NOT_FOUND_TEMPLATE = "404.html.j2"
X_DEFAULT = "x-default"


@dataclass(frozen=True)
class Page:
    template: str
    path: str


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def url_path(prefix: str, page_path: str) -> str:
    return "/" + prefix + page_path


def alternates(site: dict, page: Page) -> list[dict]:
    base = site["base_url"]
    links = [
        {"hreflang": lang["code"], "href": base + url_path(lang["prefix"], page.path)}
        for lang in site["languages"]
    ]
    default = next(lang for lang in site["languages"] if lang["code"] == site["default_lang"])
    links.append({"hreflang": X_DEFAULT, "href": base + url_path(default["prefix"], page.path)})
    return links


def lang_links(site: dict, page: Page) -> list[dict]:
    return [
        {"code": lang["code"], "label": lang["label"], "path": url_path(lang["prefix"], page.path)}
        for lang in site["languages"]
    ]


def localize(value, lang: str):
    """Pick the language variant of a {de, en, el} dict, pass plain values through."""
    return value[lang] if isinstance(value, dict) else value


def topic_href(site: dict, prefix: str, topic: dict) -> str:
    base = url_path(prefix, site["knowledge"]["path"])
    return f"{base}{topic['slug']}/" if topic["published"] else f"{base}#{topic['slug']}"


def localized_topics(site: dict, topics: list[dict], lang: dict) -> list[dict]:
    return [
        {
            "id": t["id"],
            "group": t["group"],
            "slug": t["slug"],
            "published": t["published"],
            "href": topic_href(site, lang["prefix"], t),
            **t[lang["code"]],
        }
        for t in topics
    ]


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


def page_data(site: dict, data: dict, texts: dict, lang: dict) -> dict:
    topics = localized_topics(site, data["topics"], lang)
    return {
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
        for lang in site["languages"]:
            html = template.render(
                **page_data(site, data, texts[lang["code"]], lang),
                site=site,
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
        for lang in site["languages"]:
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
    pages = [Page(**p) for p in site["pages"]]
    data = {
        "topics": load_json(TOPICS_FILE),
        "tools": load_json(TOOLS_FILE),
        "engagement": load_json(ENGAGEMENT_FILE),
    }
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
