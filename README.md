# KaleFi

**Borrow USDC against KALE on Stellar.** A single, isolated lending market written as a Soroban
contract, built for the Stellar Build hackathon and reworked afterwards as a learning project.

- Contract: `contracts/kalefi` (Rust, soroban-sdk 22), 8 tests
- Frontend: Next.js (pages router) + Freighter, `src/`
- Notes on design and what could go wrong: [lucasalmeida.me/work/kalefi](https://lucasalmeida.me/work/kalefi)

## Testnet deployment

| | Address |
| --- | --- |
| Market | `CBIKYUEPWCSU5VDTJ5DYY23NZWWT3YUWGGSFHUFR3VNKEJLMGFUGA2IM` |
| KALE (demo asset, SAC) | `CDPAUV7SYMKFW6Q7B25JC7CN2LVKHKDWAIWVMVWSOMOL2XJMKHMA4BXB` |
| USDC (demo asset, SAC) | `CD7UTN5E6GTLYWIQ6I6ESIJMI6YMSMKA6VU6JPXKPYGG2TFCNJXXGOI2` |
| Issuer / admin | `GBIXVBXCA3BOIW2ABRH52PIS3TJFKQNQHFAHCT2HVTH4JEVONNTKOMTK` |

Both assets are demo assets issued for this market; they have no value.

## How the market works

| Call | Who | What |
| --- | --- | --- |
| `deposit` | user | KALE in as collateral |
| `borrow` | user | USDC out, while debt stays within 50% of collateral value |
| `repay` / `withdraw` | user | the reverse; withdrawals keep the position healthy |
| `liquidate` | anyone | on an unhealthy position: repay up to 50% of the debt, receive that value in KALE + 5% |
| `set_price` | admin | KALE price in USDC; borrow, withdraw and liquidate refuse prices older than an hour |

Positions are stored per user in persistent storage with TTL extension.

## What changed from the hackathon version

- `init` could be called again by anyone with their own address as admin, taking over the price
  and the token addresses. It now runs once.
- Every position lived in instance storage, which grows with every user and shares one TTL.
- No liquidation path: under-collateralised debt just stayed there.
- The price was a bare admin value with no age; it now carries a timestamp and goes stale after
  an hour.
- Zero and negative amounts weren't rejected by the contract; errors were panic strings.
- The frontend simulated every call and showed a fixed 0.50 price and an 80% LTV the contract
  never had. It now reads and writes the contract through Freighter.
- The repo was nested three folders deep with a broken submodule and a lowercase `cargo.toml`
  that breaks on Linux.

Known limit: the price is set by the admin, not an oracle. A KALE feed on Reflector would replace
`set_price`; until then the app calls `/api/price/refresh` before price-sensitive actions, which
re-posts the fixed demo price once it is 30 minutes old.

## Develop

```bash
cd contracts/kalefi && cargo test          # contract tests
stellar contract build                     # wasm

npm install && npm run dev                 # frontend on http://localhost:3000
```

Server env for the demo routes: `KALEFI_ADMIN_SECRET` (issuer key, mints demo KALE in
`/api/faucet` and refreshes the price in `/api/price/refresh`).
