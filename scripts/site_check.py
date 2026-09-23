#!/usr/bin/env python3
"""Site quality checks for rehoteq.com (runs locally and in GitHub Actions).

Checks:
  1. Every <script type="application/ld+json"> block parses as JSON.
  2. Every internal href/src in HTML files resolves to a file in the repo.
  3. Every sitemap <loc> maps to an existing repository file.
  4. Sitemap membership agrees with robots: noindex pages must be absent,
     indexable pages must be present, listed pages must have a <title> and
     exactly one rel="canonical".
  5. No page carries more than one canonical link.

Exit code 0 = all checks passed. Warnings do not fail the run.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
SITE_ORIGIN = "https://rehoteq.com"

# Pages exempt from sitemap/SEO rules (verification files, error page).
EXEMPT_FROM_SITEMAP_RULES = {"404.html"}

# href/src prefixes/schemes that never point at repo files.
SKIP_PREFIXES = ("/cdn-cgi/",)
SKIP_SCHEMES = ("http:", "https:", "mailto:", "tel:", "javascript:", "data:", "sms:", "whatsapp:", "tel:")

errors = []
warnings = []


def repo_html_files():
    return sorted(
        p for p in ROOT.rglob("*.html")
        if ".git" not in p.parts and p.name != "404.html" or (p.name == "404.html" and ".git" not in p.parts)
    )


def all_html_files():
    return sorted(p for p in ROOT.rglob("*.html") if ".git" not in p.parts)


def rel(p: Path) -> str:
    return str(p.relative_to(ROOT))


def check_jsonld():
    for p in all_html_files():
        text = p.read_text(encoding="utf-8", errors="replace")
        for i, block in enumerate(re.findall(
            r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
            text, re.S)):
            try:
                json.loads(block)
            except Exception as e:
                errors.append(f"JSON-LD: {rel(p)} block {i + 1}: {e}")


def check_internal_links():
    attr_re = re.compile(r"""(?:href|src)\s*=\s*["']([^"']+)["']""", re.I)
    comment_re = re.compile(r"<!--.*?-->", re.S)
    for p in all_html_files():
        text = p.read_text(encoding="utf-8", errors="replace")
        text = comment_re.sub("", text)  # ignore commented-out markup
        for raw in attr_re.findall(text):
            url = raw.strip()
            if not url or url.startswith("#"):
                continue
            if "${" in url:  # JS template placeholder resolved at runtime
                continue
            low = url.lower()
            if any(low.startswith(s) for s in SKIP_SCHEMES):
                continue
            if any(url.startswith(pref) for pref in SKIP_PREFIXES):
                continue
            if url.startswith("//"):  # protocol-relative
                continue
            # strip query/fragment
            path = url.split("?", 1)[0].split("#", 1)[0]
            if not path:
                continue
            path = unquote(path)
            if path.startswith("/"):
                target = ROOT / path.lstrip("/")
            else:
                target = p.parent / path
            # normalize away trailing slash
            if str(path).endswith("/"):
                target = target / "index.html"
            if not target.exists():
                errors.append(f"Link: {rel(p)} -> {raw!r} (missing {target.relative_to(ROOT) if str(target).startswith(str(ROOT)) else target})")
                continue
            if target.is_dir() and not (target / "index.html").exists():
                warnings.append(f"Link: {rel(p)} -> {raw!r} points at a directory with no index.html")


def load_sitemap():
    sm = ROOT / "sitemap.xml"
    if not sm.exists():
        errors.append("sitemap.xml is missing")
        return [], {}
    text = sm.read_text(encoding="utf-8")
    locs = re.findall(r"<loc>\s*([^<]+?)\s*</loc>", text)
    entries = []
    url_to_path = {}
    for loc in locs:
        if not loc.startswith(SITE_ORIGIN):
            warnings.append(f"Sitemap: off-site <loc> {loc}")
            continue
        rest = loc[len(SITE_ORIGIN):] or "/"
        path = "index.html" if rest in ("", "/") else rest.lstrip("/")
        entries.append((loc, path))
        url_to_path[path] = loc
        if not (ROOT / path).exists():
            errors.append(f"Sitemap: {loc} -> {path} does not exist in repo")
    return entries, url_to_path


def head_meta(text):
    title = re.search(r"<title[^>]*>(.*?)</title>", text, re.S | re.I)
    robots = re.search(r'<meta[^>]+name=["\']robots["\'][^>]+content=["\']([^"\']+)["\']', text, re.I)
    if robots is None:
        robots = re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+name=["\']robots["\']', text, re.I)
    canonicals = re.findall(r'<link[^>]+rel=["\']canonical["\'][^>]+>', text, re.I)
    # also rel can appear before/after href in any order — broaden:
    canonicals = re.findall(r'<link\b[^>]*>', text, re.I) and [
        t for t in re.findall(r'<link\b[^>]*>', text, re.I) if re.search(r'rel\s*=\s*["\']canonical["\']', t, re.I)
    ]
    return (
        title.group(1).strip() if title else "",
        (robots.group(1).lower() if robots else ""),
        canonicals,
    )


def check_sitemap_seo(entries, url_to_path):
    in_sitemap = set(url_to_path)
    for p in all_html_files():
        r = rel(p)
        if r in EXEMPT_FROM_SITEMAP_RULES or re.match(r"google\w+\.html$", p.name):
            continue
        text = p.read_text(encoding="utf-8", errors="replace")
        _, robots, canonicals = head_meta(text)
        noindex = "noindex" in robots
        if len(canonicals) > 1:
            errors.append(f"SEO: {r} has {len(canonicals)} canonical links")
        if noindex and r in in_sitemap:
            errors.append(f"SEO: {r} is noindex but listed in sitemap.xml")
        if not noindex and r not in in_sitemap:
            errors.append(f"SEO: {r} is indexable but missing from sitemap.xml (add it, or add a noindex meta, or exempt it)")
        if r in in_sitemap:
            title, _, canonicals = head_meta(text)
            if not title:
                errors.append(f"SEO: {r} is in sitemap but has no <title>")
            if not canonicals:
                errors.append(f"SEO: {r} is in sitemap but has no rel=canonical")
    # canonical targets should be absolute and site-relative (warn only)
    for p in all_html_files():
        text = p.read_text(encoding="utf-8", errors="replace")
        for tag in [t for t in re.findall(r"<link\b[^>]*>", text, re.I) if re.search(r'rel\s*=\s*["\']canonical["\']', t, re.I)]:
            m = re.search(r'href\s*=\s*["\']([^"\']+)["\']', tag)
            if m:
                href = m.group(1)
                if not href.startswith(SITE_ORIGIN):
                    warnings.append(f"SEO: {rel(p)} canonical not on {SITE_ORIGIN}: {href}")


def main():
    check_jsonld()
    check_internal_links()
    entries, url_to_path = load_sitemap()
    check_sitemap_seo(entries, url_to_path)

    for w in warnings:
        print(f"WARN  {w}")
    for e in errors:
        print(f"ERROR {e}")
    n_html = len(all_html_files())
    print(f"\nChecked {n_html} HTML files, {len(entries)} sitemap URLs: "
          f"{len(errors)} error(s), {len(warnings)} warning(s)")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
