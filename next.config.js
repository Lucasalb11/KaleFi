/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-env node */
// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
let nextConfig = {
  transpilePackages: [
    // Fix for warnings about cjs/esm package duplication
    // See: https://github.com/polkadot-js/api/issues/5636
    '@polkadot',
  ],
  // Wallet-signing UI must never render inside someone else's frame (clickjacking).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

const withTwin = require('./withTwin.js')
nextConfig = withTwin(nextConfig)

module.exports = nextConfig
