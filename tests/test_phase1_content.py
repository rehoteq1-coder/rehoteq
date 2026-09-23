"""Phase 1 publishing/interlink regressions. Python stdlib only."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import unittest
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree

ROOT = Path(__file__).resolve().parents[1]
LESSONS = ["guides/solar-system-sizing-nigerian-home.html", "guides/generator-changeover-backup-power-nigeria.html", "guides/cbt-term-before-checklist-nigeria.html", "guides/phishing-whatsapp-verification-habit-nigeria.html"]
TOOLS = ["cable-size-calculator.html", "voltage-drop-calculator.html", "battery-inverter-calculator.html", "gpa-cgpa-calculator.html"]
NEW = LESSONS + TOOLS + ["knowledge-base.html"]

class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.ids, self.links, self.canonicals, self.headings = [], [], [], []
        self.anchor_depth = self.nested_anchors = 0
        self.feed((ROOT / path).read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids.append(a["id"])
        if tag == "a":
            self.nested_anchors += self.anchor_depth > 0
            self.anchor_depth += 1
            self.links.append(a.get("href", ""))
        if tag == "link" and a.get("rel") == "canonical":
            self.canonicals.append(a.get("href"))
        if tag == "h1":
            self.headings.append(tag)

    def handle_endtag(self, tag):
        if tag == "a":
            self.anchor_depth = max(0, self.anchor_depth - 1)

class Phase1Content(unittest.TestCase):
    def test_metadata_and_no_duplicate_ids(self):
        titles = []
        for name in NEW:
            doc = Document(name)
            text = (ROOT / name).read_text()
            self.assertEqual(doc.canonicals, ["https://rehoteq.com/" + name])
            self.assertEqual(len(doc.ids), len(set(doc.ids)), name)
            self.assertEqual(len(doc.headings), 1, name)
            self.assertFalse(doc.nested_anchors, name)
            self.assertRegex(text, r'<meta name="description" content="[^"]+"')
            titles.append(re.search(r"<title>(.*?)</title>", text).group(1))
            for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
                self.assertIsInstance(json.loads(block), dict)
        self.assertEqual(len(titles), len(set(titles)))

    def test_sitemap_has_all_and_no_duplicates(self):
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [loc.text for loc in ElementTree.parse(ROOT / "sitemap.xml").findall(".//s:loc", ns)]
        self.assertEqual(len(urls), len(set(urls)))
        for name in NEW:
            self.assertIn("https://rehoteq.com/" + name, urls)

    def test_hub_and_related_links(self):
        academy = Document("academy.html").links
        tools = Document("tools.html").links
        guides = Document("news.html").links
        for name in NEW:
            self.assertIn("/" + name, academy)
        for name in TOOLS:
            self.assertIn("/" + name, tools)
        for name in LESSONS:
            self.assertIn("/" + name, guides)
            self.assertIn("/academy.html", Document(name).links)
        for tool in TOOLS:
            # At least one editorial guide directly links back to each tool.
            self.assertTrue(any("/" + tool in Document(str(p.relative_to(ROOT))).links for p in (ROOT / "guides").glob("*.html")), tool)
        self.assertFalse(Document("tools.html").nested_anchors)

    def test_new_page_internal_links_and_fragments_resolve(self):
        for name in NEW:
            for href in Document(name).links:
                url = urlsplit(href)
                if url.scheme or url.netloc:
                    continue
                target = (ROOT / url.path.lstrip("/")) if url.path.startswith("/") else (ROOT / name).parent / url.path
                if not url.path:
                    target = ROOT / name
                if target.is_dir():
                    target /= "index.html"
                self.assertTrue(target.is_file(), (name, href))
                if url.fragment:
                    self.assertIn(unquote(url.fragment), Document(str(target.relative_to(ROOT))).ids, (name, href))

    def test_lessons_substantial_and_honest(self):
        for name in LESSONS:
            text = (ROOT / name).read_text()
            article = text.split("<article>")[1].split("</article>")[0]
            count = len(re.sub(r"<[^>]+>", " ", article).split())
            self.assertGreaterEqual(count, 1200, name)
            self.assertLessEqual(count, 2000, name)
            self.assertIn("illustrative training examples", article)
            self.assertIn("No named practitioner review is claimed", article)
            self.assertIn("Frequently asked questions", article)
            self.assertIn("Sources and scope", article)
            self.assertIn('class="caution"', article)

    def test_kb_entry_structure(self):
        text = (ROOT / "knowledge-base.html").read_text()
        entries = re.findall(r'<section id="[^"]+">(.*?)</section>', text, re.S)
        self.assertGreaterEqual(len(entries), 20)
        for entry in entries:
            for field in ["Definition:", "In practice:", "Example:", "Common mistake:", "Related lesson or tool"]:
                self.assertIn(field, entry)

if __name__ == "__main__":
    unittest.main()
