# SK7755 Game Aggregator API Specification

## Overview

SK7755 is a third-party game aggregation platform providing unified access to
multiple game suppliers (slots, live casino, etc.).

| Item | Value |
|------|-------|
| Test Base URL | `https://utest.sk7755.com` |
| Content-Type | `application/json` |
| Auth | MD5 signature per request |

---

## Signature Algorithm

1. Collect all request parameters (excluding `sign`).
2. Sort by **key** in ASCII ascending order.
3. Concatenate as `key1=value1&key2=value2&key=<md5key>`.
4. Compute **MD5 hex (lowercase)** → this is the `sign` value.

### Example

```
Parameters: { uid: "10001", agentid: "DDYL", timestamp: 1700000000 }
Sorted:     agentid=DDYL&timestamp=1700000000&uid=10001
With key:   agentid=DDYL&timestamp=1700000000&uid=10001&key=<md5key>
sign:       md5(above) → lowercase hex
```

---

## Active APIs (Client → SK7755)

All endpoints accept **POST** with JSON body.

### 1. GET Platform List

```
POST /api/platform
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | string | Yes | Player user ID |
| agentid | string | Yes | Merchant agent ID |
| timestamp | number | Yes | Unix epoch seconds |
| sign | string | Yes | MD5 signature |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "data": [
    { "platform": "AG", "name": "AG Live Casino" },
    { "platform": "PG", "name": "PG Slots" }
  ]
}
```

### 2. GET Game List

```
POST /api/gamelist
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | string | Yes | Player user ID |
| agentid | string | Yes | Merchant agent ID |
| platform | string | Yes | Platform code from /api/platform |
| timestamp | number | Yes | Unix epoch seconds |
| sign | string | Yes | MD5 signature |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "data": [
    { "code": "GAME001", "name": "Lucky Slots", "gameType": "slot" }
  ]
}
```

### 3. Game Login

```
POST /api/login
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | string | Yes | Player user ID |
| agentid | string | Yes | Merchant agent ID |
| platform | string | Yes | Platform code |
| code | string | Yes | Game code |
| timestamp | number | Yes | Unix epoch seconds |
| sign | string | Yes | MD5 signature |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "data": {
    "url": "https://game-provider.com/play?token=xxx"
  }
}
```

### 4. Game Info

```
POST /api/gameInfo
```

Same parameters as `/api/login`. Returns game metadata.

### 5. Get Balance

```
POST /api/balance
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | string | Yes | Player user ID |
| agentid | string | Yes | Merchant agent ID |
| timestamp | number | Yes | Unix epoch seconds |
| sign | string | Yes | MD5 signature |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "data": { "balance": "1000.00" }
}
```

### 6. Score Down (Withdraw from game wallet)

```
POST /api/scoreDown
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | string | Yes | Player user ID |
| agentid | string | Yes | Merchant agent ID |
| amount | string | Yes | Withdrawal amount |
| timestamp | number | Yes | Unix epoch seconds |
| sign | string | Yes | MD5 signature |

---

## Callback APIs (SK7755 → Us)

### WalletData Push

SK7755 pushes bet settlement and cancellation events to our server.

```
POST /api/sk7755/callback/wallet
Content-Type: application/json
```

#### Request Body

| Field | Type | Description |
|-------|------|-------------|
| action | string | `settle` or `cancelBet` |
| uid | string | Player user ID |
| accType | number | Account type (0 = main) |
| supplier | number | Game supplier ID |
| platform | string | Platform identifier |
| orderNo | string | Unique bet order number |
| mainOrderNo | string | Parent order number |
| bonusCode | string | Bonus code if applicable |
| gameType | string | `slot` / `live` |
| code | string | Game code |
| gameName | string | Game display name |
| balance | string | Balance before transaction |
| newBalance | string | Balance after transaction |
| betAmount | string | Bet amount |
| winAmount | string | Win amount |
| addAmount | string | Amount added to balance |
| subAmount | string | Amount subtracted from balance |
| betTime | number | Bet timestamp (Unix epoch) |
| stime | number | Settlement timestamp (Unix epoch) |
| currency | string | Currency code (default: CNY) |
| betType | string | `normal` / `playerbanker` |

#### Response

**Success:**
```json
{ "code": "0000", "message": "Success" }
```

**Error:**
```json
{ "code": "9999", "message": "Internal Error" }
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 0000 | Success |
| 1035 | Invalid Agent Id |
| 1036 | Invalid parameters |
| 9999 | Internal Error |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SK7755_BASE_URL` | No | `https://utest.sk7755.com` | API base URL |
| `SK7755_AGENT_ID` | No | `DDYL` | Merchant agent ID |
| `SK7755_MD5KEY` | **Yes** | — | MD5 signing key (**never commit**) |
