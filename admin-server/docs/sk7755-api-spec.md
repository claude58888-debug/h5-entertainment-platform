# SK7755 Game Aggregator API Specification

## Overview

SK7755 is a third-party game aggregation platform providing unified access to
multiple game suppliers (slots, live casino, lottery, sports, etc.).

| Item | Value |
|------|-------|
| Test Base URL | `https://utest.sk7755.com` |
| Alt Test URL | `http://43.153.210.204:7200` |
| Content-Type | `application/json` |
| Auth | MD5 signature (required for login/scoreDown; optional for read-only APIs) |

---

## Signature Algorithm

1. Collect all request parameters (excluding `sign`).
2. Sort by **key** in ASCII ascending order.
3. Concatenate as `key1=value1&key2=value2&key=<md5key>`.
4. Compute **MD5 hex (lowercase)** → this is the `sign` value.

### Example

```
Parameters: { uid: 10001, agent_id: "DDYL", timestamp: 1700000000 }
Sorted:     agent_id=DDYL&timestamp=1700000000&uid=10001
With key:   agent_id=DDYL&timestamp=1700000000&uid=10001&key=<md5key>
sign:       md5(above) → lowercase hex
```

> **Important**: The parameter name is `agent_id` (with underscore), NOT `agentid`.

---

## API Signature Requirements (实测确认)

| API | Signature Required | Notes |
|-----|-------------------|-------|
| /api/platform | **No** | Only needs `agent_id` |
| /api/gamelist | **No** | Needs `agent_id` + `platform` |
| /api/balance | **No** | Needs `uid` + `agent_id` |
| /api/login | **Yes** | Full signed params required for valid launch URL |
| /api/gameInfo | **Yes** | Full signed params |
| /api/scoreDown | **Yes** | Full signed params |

---

## Active APIs (Client → SK7755)

All endpoints accept **POST** with JSON body.

### 1. GET Platform List

```
POST /api/platform
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| agent_id | string | Yes | Merchant agent ID |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "result": [
    { "platform": "ONE-PA", "game_type": "LIVE", "ip_type": 0, "country": "" },
    { "platform": "TX-CQ9", "game_type": "SLOT", "ip_type": 0, "country": "" },
    { "platform": "AWC-FC", "game_type": "SLOT,EGAME,FH", "ip_type": 1, "country": "TW" }
  ]
}
```

### 2. GET Game List

```
POST /api/gamelist
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| agent_id | string | Yes | Merchant agent ID |
| platform | string | Yes | Platform code from /api/platform |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "result": {
    "data": [
      {
        "platform": "AWC-FC",
        "game_code": "FC-SLOT-032",
        "game_type": "SLOT",
        "image": "",
        "country": "",
        "cn_name": "逛市",
        "en_name": "NIGHT MARKET 2",
        "th_name": "ไนทมารเกต 2",
        "free_flag": ""
      }
    ]
  }
}
```

### 3. Game Login (requires signature)

```
POST /api/login
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | number | Yes | Player user ID |
| agent_id | string | Yes | Merchant agent ID |
| platform | string | Yes | Platform code |
| game_code | string | Yes | Game code (underscore!) |
| nickname | string | No | Player display name |
| currency | string | No | Currency code (default: CNY) |
| language | string | No | Language code (default: zh) |
| device | number | No | 0=desktop, 1=mobile |
| accType | number | No | Account type (0=main) |
| timestamp | number | Yes | Unix epoch seconds |
| sign | string | Yes | MD5 signature |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "result": {
    "uid": 10001,
    "urlType": 0,
    "url": "https://ttt.apihub55.com/player/login/apiLogin0?agentId=...",
    "wallet": 1,
    "balance": "",
    "supplier_id": 2
  }
}
```

### 4. Game Info (requires signature)

```
POST /api/gameInfo
```

Same signed parameters as `/api/login`. Returns game metadata.

### 5. Get Balance

```
POST /api/balance
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | number | Yes | Player user ID |
| agent_id | string | Yes | Merchant agent ID |

**Response:**
```json
{
  "code": "0000",
  "message": "Success",
  "result": {
    "uid": 10001,
    "balance": "0.00",
    "transferable": "0.00",
    "hasUnsettleRecords": 0,
    "gameInfo": "AWC"
  }
}
```

### 6. Score Down (requires signature)

```
POST /api/scoreDown
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | number | Yes | Player user ID |
| agent_id | string | Yes | Merchant agent ID |
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

**推送日志回调地址**: `https://api.qxh77.com/api/sk7755/callback/wallet` (POST, JSON)

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
| 1033 | Invalid GameId (wrong param name: use `game_code` not `gamecode`) |
| 1035 | Invalid Agent Id |
| 1036 | Invalid parameters |
| 1057 | Rate limited (访问太频繁) |
| 9999 | Internal Error |

---

## Platform List (34 platforms, test env)

| Platform | Game Types |
|----------|-----------|
| ONE-PA | LIVE |
| TX-CQ9 | SLOT |
| GA28 | LOTTERY |
| AWC-FC | SLOT, EGAME, FH |
| PP | SLOT, LIVE, EGAME |
| AWC-PG | SLOT, TABLE |
| DB | LIVE |
| AWC-EVOLUTION | LIVE |
| PC28 | LOTTERY |
| ZFPG | SLOT |
| OPS-JILI | SLOT |
| DATANG | TABLE, FH |
| WG | TABLE, SLOT |
| ONE-HACKSAW | SLOT |
| 9G | SLOT |
| PC28-NEW | LOTTERY |
| AFB | SLOT, LIVE |
| YGG | SLOT |
| WALI | TABLE, FH |
| AWC-JILI | SLOT, TABLE, FH |
| ZF-CR | SPORT |
| SPORT3S | SPORT |
| HN | MARBLES |
| ONE-NOLIMIT | SLOT |
| ZFPP | SLOT |
| TX-PG | SLOT |
| TX-JDB | SLOT |
| PA | LIVE, SLOT, FH, ESPORT |
| MG | SLOT |
| BBIN | SLOT, FH |
| PG-9G | SLOT |
| KY | SLOT, LIVE |
| VG | LIVE |
| OPS-PG | SLOT |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SK7755_BASE_URL` | No | `https://utest.sk7755.com` | API base URL |
| `SK7755_AGENT_ID` | No | `DDYL` | Merchant agent ID |
| `SK7755_MD5KEY` | **Yes** | — | MD5 signing key (**never commit**) |
