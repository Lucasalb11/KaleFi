import { REFLECTOR_WS, REFLECTOR_HTTP, MAX_LTV, LIQ_THRESHOLD } from './config.js';

const priceEl = document.getElementById('price');
const priceSourceEl = document.getElementById('price-source');
const liveDotEl = document.getElementById('live-dot');
const depositInput = document.getElementById('deposit-amount');
const borrowInput = document.getElementById('borrow-amount');
const ltvEl = document.getElementById('ltv');
const hfEl = document.getElementById('hf');
const ltEl = document.getElementById('lt');
const maxLtvEl = document.getElementById('max-ltv');
const healthChipEl = document.getElementById('health-chip');
const collateralUsdEl = document.getElementById('collateral-usd');

ltEl.textContent = `${(LIQ_THRESHOLD * 100).toFixed(0)}%`;
maxLtvEl.textContent = `${(MAX_LTV * 100).toFixed(0)}%`;

let latestPrice = 1.25; // default simulated KALE price in USDC
let unsubscribePrice = null;

function setLive(ok, sourceText) {
  liveDotEl.classList.toggle('ok', ok);
  priceSourceEl.textContent = sourceText || '';
}

function formatUsd(value) {
  if (!isFinite(value)) return '—';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatPct(value) {
  if (!isFinite(value)) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

function computeLtvAndHealth(kaleAmount, usdcBorrow, price) {
  const collateralUsd = kaleAmount * price;
  const ltv = collateralUsd === 0 ? 0 : usdcBorrow / collateralUsd;
  // Basic health factor approximation: HF = (collateral * LT) / debt
  const safeCollateral = collateralUsd * LIQ_THRESHOLD;
  const health = usdcBorrow === 0 ? Infinity : safeCollateral / usdcBorrow;
  return { collateralUsd, ltv, health };
}

function update() {
  const kale = parseFloat(depositInput.value || '0');
  const usdc = parseFloat(borrowInput.value || '0');
  const { collateralUsd, ltv, health } = computeLtvAndHealth(kale, usdc, latestPrice);

  priceEl.textContent = `KALE Price: ${formatUsd(latestPrice)}`;
  collateralUsdEl.textContent = `Collateral value: ${formatUsd(collateralUsd)}`;
  ltvEl.textContent = formatPct(ltv);
  hfEl.textContent = Number.isFinite(health) ? health.toFixed(2) : '∞';

  // Visual feedback
  healthChipEl.textContent = `Health: ${Number.isFinite(health) ? health.toFixed(2) : '∞'}`;
  healthChipEl.classList.remove('ok', 'warn', 'risk');
  let state = 'ok';
  if (ltv > MAX_LTV && ltv < LIQ_THRESHOLD) state = 'warn';
  if (ltv >= LIQ_THRESHOLD) state = 'risk';
  healthChipEl.classList.add(state);
}

function startSimulator() {
  setLive(true, '(simulated)');
  let t = 0;
  const id = setInterval(() => {
    t += 0.05;
    const base = 1.25; // $1.25
    const amp = 0.15; // +/- $0.15
    latestPrice = Math.max(0.2, base + Math.sin(t) * amp + (Math.random() - 0.5) * 0.02);
    update();
  }, 1000);
  return () => clearInterval(id);
}

async function startReflector() {
  // Prefer WS; fallback to polling HTTP; else simulator
  if (REFLECTOR_WS) {
    try {
      const ws = new WebSocket(REFLECTOR_WS);
      ws.addEventListener('open', () => setLive(true, '(Reflector WS)'));
      ws.addEventListener('message', (ev) => {
        try {
          const data = JSON.parse(ev.data);
          // Expect { symbol: 'KALE/USDC', price: number }
          if (data && typeof data.price === 'number') {
            latestPrice = data.price;
            update();
          }
        } catch (_) {}
      });
      ws.addEventListener('close', () => setLive(false, '(WS closed)'));
      ws.addEventListener('error', () => setLive(false, '(WS error)'));
      return () => ws.close();
    } catch (e) {
      console.warn('WS failed, falling back to HTTP', e);
    }
  }

  if (REFLECTOR_HTTP) {
    setLive(true, '(Reflector HTTP)');
    let stopped = false;
    (async function loop() {
      while (!stopped) {
        try {
          const res = await fetch(REFLECTOR_HTTP, { cache: 'no-store' });
          const data = await res.json();
          if (data && typeof data.price === 'number') {
            latestPrice = data.price;
            update();
          }
        } catch (e) {
          setLive(false, '(HTTP error)');
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    })();
    return () => { stopped = true; };
  }

  return startSimulator();
}

function init() {
  depositInput.addEventListener('input', update);
  borrowInput.addEventListener('input', update);
  update();

  (async () => {
    unsubscribePrice = await startReflector();
  })();
}

window.addEventListener('DOMContentLoaded', init);

