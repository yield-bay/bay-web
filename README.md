# YieldBay List

## Description

[YieldBay List](https://list.yieldbay.io) is a part of [YieldBay's](https://yieldbay.io) product suite.

It's a one-stop shop to discover and evaluate yield farms in the Polkadot & Kusama Paraverse.

Currently we're aggregating close to 150 yield farms from 10+ protocols across the ecosystem like [Karura DEX](https://karura.network), [StellaSwap](https://stellaswap.com), [Mangata X](https://mangata.finance) to name a few.

## How to setup a development environment?

1. Clone the repo:

```
git clone https://github.com/yield-bay/bay-listicle-v2.git
```

2. Install the dependencies

```
cd bay-listicle-v2
yarn
```

3. Setup & run the backend services

   - [bay-api](https://github.com/yield-bay/bay-api) - GraphQL API that the frontend consumes.
   - [bay-watcher](https://github.com/yield-bay/bay-watcher) - Indexer for yield farms written in Rust.
   - [bay-watcher-ts](https://github.com/yield-bay/bay-watcher-ts) - Indexer for yield farms written in Typescript.

4. Create a .env file and add the URL for `bay-api` from above.

```
NEXT_PUBLIC_API_URL=<insert api url>
```

4. Start the dev server

```
yarn dev
```

## How to get in touch?

YieldBay's engineering team is active and open to questions on our [discord server](https://discord.com/invite/AKHuvbz7q4).
