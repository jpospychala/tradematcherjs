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
