# 🚀 KaleFi Smart Contract Deployment Guide

This guide will help you deploy the KaleFi lending protocol smart contracts to the Stellar network.

## 📋 Prerequisites

- **Node.js 18+** and **npm/yarn**
- **Rust** and **Cargo** installed
- **Soroban CLI** installed
- **Stellar wallet** (Freighter recommended) with test tokens

## 🔧 Installation

### 1. Install Soroban CLI

```bash
curl -sSfL https://soroban.stellar.org/install.sh | sh
```

### 2. Configure Networks

```bash
# Add testnet
soroban config network add --global testnet https://soroban-testnet.stellar.org

# Add standalone (for local testing)
soroban config network add --global standalone http://localhost:8000

# Add futurenet
soroban config network add --global futurenet https://rpc-futurenet.stellar.org
```

### 3. Install Dependencies

```bash
# Frontend dependencies
yarn install

# Rust WASM target
rustup target add wasm32-unknown-unknown
```

## 🏗️ Building Contracts

### 1. Build All Contracts

```bash
cd contracts
make build
```

This will compile:

- **KaleFi Lending Contract** (`kalefi.wasm`)
- **Token Contracts** (`token.wasm`)

### 2. Verify Build

```bash
# Check if WASM files were created
ls -la .soroban/*.wasm
```

## 🚀 Deployment Options

### Option 1: Deploy to Standalone (Local Testing)

```bash
cd contracts
make deploy-standalone
```

**Pros:**

- Fast and free
- Good for development and testing
- No network fees

**Cons:**

- Only accessible locally
- Requires running standalone network

### Option 2: Deploy to Testnet

```bash
cd contracts
make deploy-testnet
```

**Pros:**

- Public testnet
- Real network conditions
- Free test tokens available

**Cons:**

- Slower than standalone
- Network fees (test tokens)

### Option 3: Deploy to Futurenet

```bash
cd contracts
make deploy-futurenet
```

**Pros:**

- Latest Stellar features
- Good for testing new functionality

**Cons:**

- May be unstable
- Network fees

## 📝 Deployment Process

### 1. Complete Deployment (Recommended)

```bash
cd contracts
make deploy-all
```

This will:

1. Deploy KALE and USDC tokens
2. Deploy the main KaleFi lending contract
3. Configure all contracts to work together

### 2. Step-by-Step Deployment

```bash
# Deploy tokens only
make deploy-tokens

# Deploy KaleFi contract (requires tokens)
make deploy-kalefi

# Deploy to specific network
make deploy-testnet
```

## 🔍 Verification

### 1. Check Deployment Status

```bash
make status
```

### 2. Test Contracts

```bash
# Test the complete protocol
make test

# Test tokens only
make test-tokens
```

### 3. View Deployed Contracts

```bash
# Check deployments.json
cat deployments.json

# Check .soroban directory
ls -la .soroban/
```

## 🌐 Network Configuration

### Standalone Network

- **URL**: `http://localhost:8000`
- **Passphrase**: `Standalone Network ; February 2017`
- **Use Case**: Local development and testing

### Testnet

- **URL**: `https://soroban-testnet.stellar.org`
- **Passphrase**: `Test SDF Network ; September 2015`
- **Use Case**: Public testing and validation

### Futurenet

- **URL**: `https://rpc-futurenet.stellar.org`
- **Passphrase**: `Test SDF Future Network ; October 2022`
- **Use Case**: Testing latest features

## 🧪 Testing

### 1. Frontend Testing

```bash
# Start the frontend
yarn dev

# Open http://localhost:3000
# Connect your wallet
# Test deposit/borrow functionality
```

### 2. Contract Testing

```bash
cd contracts
cargo test
```

### 3. Integration Testing

```bash
cd contracts
yarn test:integration
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Contract not found" Error

```bash
# Check if contracts are deployed
make status

# Redeploy if necessary
make deploy-standalone
```

#### 2. "Network not configured" Error

```bash
# Add the network
soroban config network add --global standalone http://localhost:8000

# List configured networks
soroban config network list
```

#### 3. "WASM not found" Error

```bash
# Rebuild contracts
make build

# Check WASM files
ls -la .soroban/*.wasm
```

#### 4. "Insufficient balance" Error

```bash
# Get test tokens (testnet/futurenet)
soroban config identity generate --global testnet
soroban config identity fund --global testnet
```

### Reset Everything

```bash
# Clean build artifacts
make clean

# Rebuild and redeploy
make build
make deploy-standalone
```

## 📊 Monitoring

### 1. Contract Status

- Check `deployments.json` for contract addresses
- Monitor `.soroban/` directory for contract hashes
- Use `make status` for quick overview

### 2. Network Status

- **Standalone**: Check if local network is running
- **Testnet**: Monitor Stellar testnet status
- **Futurenet**: Check for network updates

### 3. Frontend Status

- Check browser console for errors
- Verify wallet connection
- Test contract interactions

## 🚀 Next Steps

After successful deployment:

1. **Test all functionality** in the frontend
2. **Verify contract interactions** work correctly
3. **Check security parameters** (LTV, liquidation thresholds)
4. **Monitor for any issues** or unexpected behavior
5. **Prepare for mainnet deployment** when ready

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the contract logs and error messages
3. Check the [Stellar documentation](https://developers.stellar.org/)
4. Open an issue in the GitHub repository

---

**Happy Deploying! 🎉**
