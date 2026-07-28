#!/usr/bin/env bash
# Build a static (no-server) export of the AAA site for shared hosting
# (Hostinger). Copies the app to a scratch dir, strips the server-only bits,
# converts to `output: export`, builds, and zips → ~/Desktop/aaa-hostinger.zip.
#
# Re-run any time after changing the main app:  bash scripts/build-static.sh
set -euo pipefail

SRC="$HOME/artist-site-app"
DST="/tmp/aaa-static"
ZIP="$HOME/Desktop/aaa-hostinger.zip"

echo "▸ syncing source → $DST"
rm -rf "$DST"; mkdir -p "$DST"
rsync -a --exclude node_modules --exclude .next --exclude out --exclude .git "$SRC"/ "$DST"/
# clone deps (instant copy-on-write on APFS); Turbopack won't follow a symlink out of root
cp -Rc "$SRC/node_modules" "$DST/node_modules" 2>/dev/null || cp -R "$SRC/node_modules" "$DST/node_modules"

echo "▸ removing server-only routes (api / admin / login / proxy)"
rm -rf "$DST/src/app/api" "$DST/src/app/admin" "$DST/src/app/login"
# output:export doesn't support the proxy (middleware) convention
rm -f "$DST/src/proxy.ts"

echo "▸ writing static next.config.ts"
cat > "$DST/next.config.ts" <<'CFG'
import type { NextConfig } from "next";
import path from "node:path";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: path.join(__dirname) },
};
export default nextConfig;
CFG

echo "▸ applying static transforms"
cd "$DST"
python3 - <<'PY'
import re, glob, pathlib

# strip force-dynamic from every page
for p in glob.glob("src/app/**/page.tsx", recursive=True):
    t = pathlib.Path(p).read_text()
    n = re.sub(r'\nexport const dynamic = "force-dynamic";\n', '\n', t)
    if n != t: pathlib.Path(p).write_text(n)

def edit(p, fn):
    path = pathlib.Path(p)
    if not path.exists(): return
    path.write_text(fn(path.read_text()))

# PaperHeader + shop page: no server auth on a static host
def drop_admin(s):
    s = s.replace('import { isAdmin } from "@/lib/auth";\n', '')
    s = s.replace("const [admin, content] = await Promise.all([isAdmin(), readContent()]);",
                  "const content = await readContent();\n  const admin = false;")
    s = s.replace("const [content, admin] = await Promise.all([readContent(), isAdmin()]);",
                  "const content = await readContent();\n  const admin = false;")
    return s
edit("src/components/paper/paper-header.tsx", drop_admin)
edit("src/app/shop/page.tsx", drop_admin)

# generateStaticParams for the dynamic routes (insert before generateMetadata)
def add_gsp(p, body):
    path = pathlib.Path(p); s = path.read_text()
    if "generateStaticParams" in s: return
    s = s.replace("export async function generateMetadata", body + "\nexport async function generateMetadata", 1)
    path.write_text(s)
add_gsp("src/app/shop/[slug]/page.tsx",
'''export async function generateStaticParams() {
  const { products } = await readContent();
  return products.map((p) => ({ slug: p.slug }));
}
''')
add_gsp("src/app/collection/[category]/page.tsx",
'''export async function generateStaticParams() {
  const { collections } = await readContent();
  return collections.map((c) => ({ category: c.id }));
}
''')
print("transforms done")
PY

echo "▸ building static export"
rm -rf .next out
npm run build

echo "▸ packaging → $ZIP"
cd "$DST/out"
cat > .htaccess <<'HT'
ErrorDocument 404 /404.html
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
HT
rm -f "$ZIP"
zip -rqX "$ZIP" . -x ".DS_Store"
echo "✓ done: $ZIP"
ls -lh "$ZIP" | awk '{print "  "$5}'
