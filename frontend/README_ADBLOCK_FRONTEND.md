# AdBlock Detection (Frontend)

## Environment variables
Use Vite env vars:

- `VITE_AD_BAIT_PATH=/ads-bait-a9f3d1.js`
- `VITE_ADBLOCK_LOG_ENDPOINT=/api/log/adblock`

Backend equivalent for shared docs:

- `AD_BAIT_PATH=/ads-bait-a9f3d1.js`
- `ADBLOCK_LOG_ENDPOINT=/api/log/adblock`

## Integration
Wrap calculator routes with `CalculatorLayout` so detection runs on every calculator page.

- Hook: `frontend/src/hooks/useAdblockDetector.tsx`
- Modal: `frontend/src/components/AdblockModal.tsx`
- Heuristics: `frontend/src/utils/adblockDetect.ts`

## Heuristics
1. DOM bait (`ads`, `adsbox`, `ad-banner`, `ad-bait`)
2. Bait `fetch()` probe
3. Script-load probe (`ads-prebid-*`)
4. Weak window variable check (`canRunAds`, `isAdBlockActive`)

Detection is marked true when:
- at least 2 strong checks are positive, OR
- at least 1 strong check + weak signal true.

## Manual QA checklist
- [ ] Chrome default profile (no blocker) → no modal, logs show `detected=false`
- [ ] Chrome + AdBlock → modal appears, retry clears only after whitelist
- [ ] Chrome + Adblock Plus → modal appears
- [ ] Chrome + uBlock Origin → modal appears
- [ ] Firefox + Ghostery → modal appears
- [ ] Mobile browser with content blocker enabled → behavior verified
- [ ] Retry flow works after disable/allow-list
- [ ] Help page opens from modal

## False positive target
Track sampled sessions and compute:

$falsePositiveRate = \frac{detected\_true\_on\_clean\_browser}{total\_clean\_browser\_sessions}$

Target: `<= 1%`.
