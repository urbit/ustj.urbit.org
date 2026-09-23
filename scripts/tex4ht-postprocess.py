#!/usr/bin/env python3
r"""Turn TeX4ht output into a USTJ article page.

Usage, from a manuscript directory after building the PDF (so mss.bbl exists):

    make4ht -x mss.tex "mathjax" && make4ht -x mss.tex "mathjax"
    python3 /path/to/tex4ht-postprocess.py [out.html]

Reads mss.html plus the footnote files mss2.html, mss3.html, ... and writes
out.html (default mss0.html) with: double-quoted attributes (the site's
citations page and the older postprocess expect them), ~patp wrapped in
<code>, footnotes inlined under a Footnotes heading with backlinks, the
site's shared /latex.css, the PNG logo, and MathJax macros for \textsc and
the preamble's \mathand / \mathor.  Copy the result and ustj-logo-.png into
public/ustj/<issue>/ and add "pdf"/"html" to the article in ustj/<issue>.json.
"""
import re, glob, sys

html = open('mss.html').read()

# 1. Normalise single-quoted attributes to double quotes (inside tags only).
def fix_tag(m):
    tag = m.group(0)
    return re.sub(r"(\s[\w:-]+)='([^']*)'", r'\1="\2"', tag)
html = re.sub(r'<[^>]+>', fix_tag, html)

# 2. Whitespace cleanups.
html = html.replace(' ', ' ').replace(' ', ' ')
html = re.sub(r'<a \n', '<a ', html)

# 3. Mark ~patp as code (skip ones already inside <code>).
html = re.sub(r'(?<!<code>)(?<!\w)~[a-z]{6}-[a-z]{6}\b(?![^<]*</code>)', r'<code>\g<0></code>', html)

# 4. Footnote links point into the main file.
html = re.sub(r'href="mss\d+\.html#fn(\d+)x(\d+)"', r'href="#fn\1x\2"', html)

# 5. Map footnote number -> anchor id after the mark, for backlinks.
backlinks = {}
for m in re.finditer(r'<span class="footnote-mark"><a href="#fn(\d+)x\d+">.*?</a></span><a id="([^"]+)"></a>', html):
    backlinks[m.group(1)] = m.group(2)

# 6. Inline footnotes from mss2.html, mss3.html, ...
notes = []
for path in sorted([p for p in glob.glob('mss[0-9]*.html') if int(re.search(r'mss(\d+)', p).group(1)) >= 2], key=lambda p: int(re.search(r'mss(\d+)', p).group(1))):
    body = open(path).read()
    body = re.sub(r'<[^>]+>', fix_tag, body)
    body = re.search(r'<body[^>]*>(.*)</body>', body, re.S).group(1).strip()
    body = body.replace(' ', ' ')
    num = re.search(r'id="fn(\d+)x0"', body)
    if num and num.group(1) in backlinks:
        body = body.replace('</p></div>', f'<a href="#{backlinks[num.group(1)]}">⤴</a></p></div>')
    body = re.sub(r'(?<!<code>)(?<!\w)~[a-z]{6}-[a-z]{6}\b', r'<code>\g<0></code>', body)
    notes.append(body)
if notes:
    section = '<h3 class="sectionHead"><a id="x1-65536"></a>Footnotes</h3>\n' + '\n'.join(notes) + '\n'
    html = html.replace('</body>', section + '</body>')

# 7a. MathJax: the paper's preamble macros and \\textsc are not known to
# MathJax, so define them in the page config (html package gives \\style).
old_cfg = 'window.MathJax = { tex: { tags: "ams", }, };'
new_cfg = ('window.MathJax = { tex: { tags: "ams", packages: {"[+]": ["html"]}, '
           'macros: { mathand: "\\\\wedge", mathor: "\\\\vee", '
           'textsc: ["\\\\style{font-variant:small-caps}{\\\\text{#1}}", 1] } } };')
assert old_cfg in html, "MathJax config not found"
html = html.replace(old_cfg, new_cfg)

# 7. Site conventions: shared stylesheet, PNG logo.
html = html.replace('href="mss.css"', 'href="/latex.css"')
html = html.replace('src="ustj-logo.svg"', 'src="ustj-logo-.png"')

out = sys.argv[1] if len(sys.argv) > 1 else 'mss0.html'
open(out, 'w').write(html)
print('footnotes:', len(notes), 'backlinks:', backlinks)
