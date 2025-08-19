# KALE / USDC Dashboard

Simple static dashboard demonstrating:

1. Dark-mode UI with two cards:
   * **Deposit KALE**
   * **Borrow USDC** (displays live Health Factor)
2. Integration with “Reflector” price endpoint (with automatic fallback to CoinGecko) to pull real-time prices.
3. Dynamic Loan-to-Value / Health Factor calculation with visual feedback:
   * **Green** – safe (HF ≥ 1)
   * **Red** – risky (HF < 1)

---

## Running Locally

Because the project is a single static HTML file, you can open it directly in the browser:

```bash
xdg-open index.html    # Linux
open index.html        # macOS
```

Or serve it with any static HTTP server (recommended to avoid CORS issues on some browsers):

```bash
python3 -m http.server 8080
```

Then navigate to `http://localhost:8080`.

---

### Customising the Reflector endpoint

If you have the official Reflector price endpoint, replace the placeholder URL inside `<script>` at the bottom of `index.html`:

```javascript
fetch(`https://api.reflector.finance/price?asset=${symbol}`);
```

with the actual endpoint provided by Reflector.

---

### License

MIT