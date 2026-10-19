# /// script
# requires-python = ">=3.12"
# dependencies = ["jinja2==3.1.6", "markdown-it-py==4.2.0", "pyyaml==6.0.3"]
# ///
"""Render the static language versions of security.charemma.de into html/."""

import json
import re
import shutil
from dataclasses import dataclass
from datetime import date
from html.parser import HTMLParser
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

# Article animation, spec 006
SCENE_SUFFIX = "-scene.j2"
ANIMATION_LINE = "[animation]"
CHAPTERS_MIN = 4
CHAPTERS_MAX = 6
DURATION_MIN_MS = 7000
DURATION_MAX_MS = 11000
CUE_FIXED_MS = 500
CUE_END_GAP_MS = 3000
TYPE_MAX_CHARS = 180
CUE_EFFECTS = {"show", "hide", "swap", "type", "lines", "press", "merge"}
CUE_NEEDS_FOR = {"type", "lines", "merge"}
FORBIDDEN_TAGS = {"script", "style", "canvas", "img"}


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
    has_scene: bool


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


class Element:
    """A minimal element node: tag, attributes and child elements."""

    __slots__ = ("tag", "attrs", "children", "parent", "text")

    def __init__(self, tag: str, attrs: dict[str, str | None], parent):
        self.tag = tag
        self.attrs = attrs
        self.children: list["Element"] = []
        self.parent = parent
        self.text: list[str] = []

    def has(self, name: str) -> bool:
        return name in self.attrs

    def descendants(self):
        for child in self.children:
            yield child
            yield from child.descendants()

    def text_content(self) -> str:
        return "".join(self.text) + "".join(child.text_content() for child in self.children)


# Void elements never nest children; close them immediately.
_VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}


class _TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("#root", {}, None)
        self._cur = self.root

    def handle_starttag(self, tag, attrs):
        el = Element(tag, dict(attrs), self._cur)
        self._cur.children.append(el)
        if tag not in _VOID_TAGS:
            self._cur = el

    def handle_startendtag(self, tag, attrs):
        self._cur.children.append(Element(tag, dict(attrs), self._cur))

    def handle_endtag(self, tag):
        node = self._cur
        while node is not self.root and node.tag != tag:
            node = node.parent
        if node is not self.root and node.parent is not None:
            self._cur = node.parent

    def handle_data(self, data):
        self._cur.text.append(data)


def parse_html(html: str) -> Element:
    builder = _TreeBuilder()
    builder.feed(html)
    return builder.root


class _TypedSpans(HTMLParser):
    """Find the content ranges (start, end offsets) of every data-cue="type" element."""

    def __init__(self, html: str):
        super().__init__(convert_charrefs=False)
        self._line_starts = [0]
        for i, ch in enumerate(html):
            if ch == "\n":
                self._line_starts.append(i + 1)
        self._depth: list[str] = []
        self._open: list[tuple[int, int]] = []  # (content start, depth at start)
        self.ranges: list[tuple[int, int]] = []

    def _offset(self) -> int:
        line, col = self.getpos()
        return self._line_starts[line - 1] + col

    def handle_starttag(self, tag, attrs):
        if tag in _VOID_TAGS:
            return
        self._depth.append(tag)
        if dict(attrs).get("data-cue") == "type":
            self._open.append((self._offset() + len(self.get_starttag_text()), len(self._depth)))

    def handle_endtag(self, tag):
        if self._open and self._open[-1][1] == len(self._depth):
            start, _ = self._open.pop()
            self.ranges.append((start, self._offset()))
        if self._depth:
            self._depth.pop()


def strip_typed_indentation(html: str) -> str:
    """Drop whitespace after a line break inside typed text; it stems from the template's indentation."""
    finder = _TypedSpans(html)
    finder.feed(html)
    out = html
    for start, end in sorted(finder.ranges, reverse=True):
        out = out[:start] + re.sub(r"\n[ \t]+", "\n", out[start:end]) + out[end:]
    return out


def nearest_variant(el: Element) -> str | None:
    """The data-variant of the panel the element sits in, or None."""
    node = el.parent
    while node is not None:
        if node.has("data-panel"):
            return node.attrs.get("data-variant")
        node = node.parent
    return None


def cue_end(effect: str, at: int, dur: int | None) -> int:
    if dur is not None:
        return at + dur
    return at + CUE_FIXED_MS


def check_cue_group(cues: list[tuple[int, int, str]], duration: int, where: str) -> None:
    """cues: (start, end, label); no two busy intervals overlap, last ends in time."""
    ordered = sorted(cues)
    for (_, prev_end, prev_label), (start, _, label) in zip(ordered, ordered[1:]):
        if start < prev_end:
            raise ValueError(f"{where}: cue '{label}' overlaps cue '{prev_label}'")
    for _, end, label in ordered:
        if end > duration - CUE_END_GAP_MS:
            raise ValueError(
                f"{where}: cue '{label}' ends at {end} ms, not {CUE_END_GAP_MS} ms before the chapter's {duration} ms"
            )


def check_caption_start(caption: Element, is_first_chapter: bool, where: str) -> None:
    kids = caption.children
    if is_first_chapter and kids and kids[0].tag == "span" and kids[0].has("data-scenario"):
        kids = kids[1:]
    if not kids or kids[0].tag != "strong":
        raise ValueError(f"{where}: a caption must start with <strong>")


def check_chapter_captions(chapter: Element, panels: list[Element], captions: list[Element], where: str) -> None:
    shown = [p.attrs.get("data-variant") for p in panels]
    for variant in dict.fromkeys(shown):  # keep order, drop duplicates
        applies = [c for c in captions if c.attrs.get("data-variant") in (None, variant)]
        if len(applies) != 1:
            name = variant or "the chapter"
            raise ValueError(f"{where}: {name} must have exactly one caption, found {len(applies)}")


def check_scene(figure_html: str, path: Path) -> None:
    """Fail, with file and reason, on every condition spec 006 lists for the build."""
    root = parse_html(figure_html)
    where0 = str(path)

    for el in root.descendants():
        if el.tag in FORBIDDEN_TAGS:
            raise ValueError(f"{where0}: scene contains <{el.tag}>")
        if "style" in el.attrs:
            raise ValueError(f"{where0}: scene contains a style attribute")

    switches = [el for el in root.descendants() if el.has("data-switch")]
    variant_ids: set[str] = set()
    for sw in switches:
        spans = [c for c in sw.children if c.has("data-variant")]
        variant_ids.update(s.attrs["data-variant"] for s in spans)
    if switches and len(variant_ids) != 2:
        raise ValueError(f"{where0}: a switch must have exactly two variants")

    for el in root.descendants():
        value = el.attrs.get("data-variant")
        if value is None or el.has("data-switch") or el.parent and el.parent.has("data-switch"):
            continue
        if not switches:
            raise ValueError(f"{where0}: data-variant '{value}' without a switch")
        if value not in variant_ids:
            raise ValueError(f"{where0}: data-variant '{value}' is not one of the switch's variants")

    lenses = [el for el in root.descendants() if el.has("data-aha")]
    if len(lenses) != 1:
        raise ValueError(f"{where0}: the scene must have exactly one interactive moment, found {len(lenses)}")
    lens = lenses[0]
    if not any(c.has("data-raw") for c in lens.descendants()):
        raise ValueError(f"{where0}: the lens has no data-raw child")
    if not (lens.has("data-at") and lens.has("data-for")):
        raise ValueError(f"{where0}: the lens lacks data-at or data-for")

    chapters = [el for el in root.descendants() if el.has("data-chapter")]
    if not CHAPTERS_MIN <= len(chapters) <= CHAPTERS_MAX:
        raise ValueError(f"{where0}: a scene has {CHAPTERS_MIN} to {CHAPTERS_MAX} chapters, found {len(chapters)}")

    for index, chapter in enumerate(chapters):
        label = chapter.attrs.get("data-label")
        where = f"{where0}: chapter {index + 1}" + (f" ({label})" if label else "")
        for attr in ("data-label", "data-duration", "data-address"):
            if not chapter.attrs.get(attr):
                raise ValueError(f"{where}: missing {attr}")
        duration = int(chapter.attrs["data-duration"])
        if not DURATION_MIN_MS <= duration <= DURATION_MAX_MS:
            raise ValueError(f"{where}: duration {duration} ms is outside {DURATION_MIN_MS}-{DURATION_MAX_MS} ms")

        panels = [el for el in chapter.descendants() if el.has("data-panel")]
        if not panels:
            raise ValueError(f"{where}: has no panel")
        variantful = [p for p in panels if p.has("data-variant")]
        if variantful and len(variantful) != len(panels):
            raise ValueError(f"{where}: mixes panels with and without data-variant")

        captions = [el for el in chapter.descendants() if el.has("data-caption")]
        for caption in captions:
            check_caption_start(caption, index == 0, where)
        check_chapter_captions(chapter, panels, captions, where)

        by_group: dict[str | None, list[tuple[int, int, str]]] = {}
        for cue in chapter.descendants():
            effect = cue.attrs.get("data-cue")
            if effect is None:
                continue
            if effect not in CUE_EFFECTS:
                raise ValueError(f"{where}: unknown cue effect '{effect}'")
            if not cue.has("data-at"):
                raise ValueError(f"{where}: cue '{effect}' lacks data-at")
            if effect in CUE_NEEDS_FOR and not cue.has("data-for"):
                raise ValueError(f"{where}: cue '{effect}' lacks data-for")
            if effect == "type" and len(cue.text_content()) > TYPE_MAX_CHARS:
                raise ValueError(
                    f"{where}: typed text has {len(cue.text_content())} characters, at most {TYPE_MAX_CHARS} are allowed"
                )
            at = int(cue.attrs["data-at"])
            dur = int(cue.attrs["data-for"]) if cue.has("data-for") else None
            by_group.setdefault(nearest_variant(cue), []).append((at, cue_end(effect, at, dur), effect))
        if lens in chapter.descendants():
            at = int(lens.attrs["data-at"])
            dur = int(lens.attrs["data-for"])
            by_group.setdefault(nearest_variant(lens), []).append((at, at + dur, "lens"))
        for variant, cues in by_group.items():
            scope = where + (f" [{variant}]" if variant else "")
            check_cue_group(cues, duration, scope)


def split_animation(body: str, path: Path, has_scene: bool) -> tuple[str, str] | None:
    """Split the body at the [animation] line; pair it with the scene file's presence."""
    positions = [i for i, line in enumerate(body.split("\n")) if line.strip() == ANIMATION_LINE]
    if has_scene and not positions:
        raise ValueError(f"{path}: a scene file exists but the body has no {ANIMATION_LINE} line")
    if positions and not has_scene:
        raise ValueError(f"{path}: the body has an {ANIMATION_LINE} line but no scene file")
    if not has_scene:
        return None
    lines = body.split("\n")
    at = positions[0]
    return "\n".join(lines[:at]), "\n".join(lines[at + 1 :])


def load_articles(site: dict, topics: list[dict], env: "Environment", texts: dict) -> dict[str, dict[str, Article]]:
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
        has_scene = (ARTICLES_DIR / f"{slug}-{lang}{SCENE_SUFFIX}").exists()
        articles[lang][slug] = Article(
            slug=slug,
            lang=lang,
            lead=meta["lead"],
            updated=iso_date(meta["updated"], path),
            sources=meta.get("sources") or [],
            body_html=render_body(renderer, env, texts[lang], body, slug, lang, path),
            has_scene=has_scene,
        )
    return articles


def render_body(renderer, env: "Environment", t: dict, body: str, slug: str, lang: str, path: Path) -> str:
    """Render the Markdown body, placing the animation figure at the [animation] line."""
    scene_name = f"{slug}-{lang}{SCENE_SUFFIX}"
    scene_path = ARTICLES_DIR / scene_name
    split = split_animation(body, path, scene_path.exists())
    if split is None:
        return renderer.render(body)
    figure_html = strip_typed_indentation(env.get_template(scene_name).render(t=t, lang=lang))
    check_scene(figure_html, scene_path)
    before, after = split
    return renderer.render(before) + figure_html + renderer.render(after)


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
    env = Environment(
        loader=FileSystemLoader([str(TEMPLATE_DIR), str(ARTICLES_DIR)]),
        autoescape=True,
        undefined=StrictUndefined,
        keep_trailing_newline=True,
    )
    articles = load_articles(site, topics, env, texts)
    pages = [Page(**p) for p in site["pages"]] + article_pages(site, topics, articles)
    data = {
        "topics": topics,
        "articles": articles,
        "tools": load_json(TOOLS_FILE),
        "engagement": load_json(ENGAGEMENT_FILE),
    }
    remove_stale_article_dirs(site, topics, articles)
    render_pages(env, site, texts, data, pages)
    render_not_found(env, site, texts)
    render_sitemap(site, pages)


if __name__ == "__main__":
    main()
