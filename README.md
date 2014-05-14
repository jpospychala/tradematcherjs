TradeMatcherJS
===

Sample transaction matching engine that finds deals between
buy and sell offers of same price.

It stores entire market in memory and has several
storage backends for persistence.

This project is aimed for testing market implementations,
their complexity and performance.

Performance highlight
---
```
 inMemory  ~1100000 offers/sec
 Mongo     ~900 offers/sec
 Postgres  ~450 offers/sec
```

Implementation details
---
inMemory:
 1. Receives new offer
 2. Performs deals until opposite offers available
 3. Adds unmatched offer to the market

Mongo/Postgres:
 1. Receives new offer
 2. Stores new offer in DB
 3. Matching process (same as in inMemory)
 4. Store all matches in DB
