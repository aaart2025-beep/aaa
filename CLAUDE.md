@AGENTS.md

## Deploy Configuration (configured by /setup-deploy)
- Platform: vercel
- Production URL: https://www.artbyaaa.com (vercel.app fallback: https://aaa-website-lac.vercel.app)
- Deploy workflow: auto-deploy on push to main (GitHub: aaart2025-beep/aaa-website)
- Deploy status command: vercel ls
- Merge method: merge
- Project type: web app (Next.js e-commerce)
- Post-deploy health check: https://www.artbyaaa.com

### Custom deploy hooks
- Pre-merge: npx tsc --noEmit && npx next build
- Deploy trigger: automatic on push to main (or `vercel deploy --prod --yes`)
- Deploy status: vercel ls
- Health check: curl -sf https://www.artbyaaa.com -o /dev/null -w "%{http_code}"

### Dedicated client accounts (handover)
- GitHub: aaart2025-beep → private repo aaa-website
- Vercel: team aaart2025-beeps-projects (Pro) → project aaa-website
  - Blob store: aaa-data (private; OIDC auth via injected BLOB_STORE_ID — no static token)
  - Domains: artbyaaa.com (308 → www), www.artbyaaa.com (production)
- Supabase: org "aaart2025-beep's Org" → project "amit amar art" (ref ezywfxinftfurrwqmoix)
  - Provisioned for the future customer-accounts feature; not referenced by code yet
  - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY set in Vercel (Production + Development)
