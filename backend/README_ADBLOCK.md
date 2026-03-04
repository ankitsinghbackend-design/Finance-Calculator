# AdBlock Logging (Backend)

## Endpoint
- `POST /api/log/adblock`

Payload shape:

```json
{
  "location": "finance-calculators",
  "url": "https://example.com/finance",
  "userAgent": "Mozilla/5.0 ...",
  "detected": true,
  "details": { "domBait": { "positive": true } },
  "ts": "2026-03-04T10:10:10.000Z"
}
```

## Environment variables
- `ADBLOCK_LOG_TTL_DAYS` (default `60`)
- `ADBLOCK_RATE_LIMIT_WINDOW_MS` (default `60000`)
- `ADBLOCK_RATE_LIMIT_MAX` (default `120`)
- `ADBLOCK_IP_HASH_SALT` (salt used to hash network source hint)

## Notes
- Logs are aggregated by day (`bucketDate`) and `(url, location, detected)` with a `count` increment.
- Raw IP addresses are not persisted. A one-way `sourceHash` is stored in `details` for abuse analysis.
- A TTL index automatically removes old rows.

## Daily adblock detection rate aggregation (sample)

```js
[
  {
    $group: {
      _id: { day: { $dateToString: { format: '%Y-%m-%d', date: '$bucketDate' } }, url: '$url' },
      totalEvents: { $sum: '$count' },
      detectedEvents: { $sum: { $cond: [{ $eq: ['$detected', true] }, '$count', 0] } }
    }
  },
  {
    $addFields: {
      adblockRate: {
        $cond: [{ $eq: ['$totalEvents', 0] }, 0, { $divide: ['$detectedEvents', '$totalEvents'] }]
      }
    }
  }
]
```
