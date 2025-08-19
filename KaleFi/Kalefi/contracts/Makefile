# KaleFi Deployment Makefile

.PHONY: help build deploy-tokens deploy-kalefi deploy-all clean test

# Default target
help:
	@echo "KaleFi Deployment Commands:"
	@echo "============================"
	@echo "build                    - Build all contracts"
	@echo "deploy-tokens            - Deploy KALE and USDC tokens only (standalone)"
	@echo "deploy-tokens-network    - Deploy tokens to specific network"
	@echo "deploy-kalefi            - Deploy KaleFi contract (requires tokens)"
	@echo "deploy-all               - Complete deployment (tokens + KaleFi)"
	@echo "deploy-standalone        - Deploy to standalone network"
	@echo "deploy-testnet           - Deploy to testnet network"
	@echo "deploy-futurenet         - Deploy to futurenet network"
	@echo "test                     - Test the deployed protocol"
	@echo "test-tokens              - Test tokens only"
	@echo "clean                    - Clean build artifacts"
	@echo ""
	@echo "Usage examples:"
	@echo "  make deploy-standalone           # Deploy to standalone"
	@echo "  make deploy-testnet              # Deploy to testnet"
	@echo "  make deploy-tokens               # Deploy tokens to standalone"
	@echo "  make deploy-tokens-network NETWORK=testnet  # Deploy tokens to testnet"
	@echo "  make test-tokens                 # Test tokens only"

# Build all contracts
build:
	@echo "🔨 Building contracts..."
	cd kalefi && cargo build --target wasm32-unknown-unknown --release
	cd kalefi/soroban-examples/token && cargo build --target wasm32-unknown-unknown --release
	@echo "✅ Build complete!"

# Deploy tokens only
deploy-tokens:
	@echo "🚀 Deploying tokens..."
	@if [ ! -f "kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm" ]; then \
		echo "❌ Token WASM not found. Run 'make build' first."; \
		exit 1; \
	fi
	@cp kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm .soroban/token.wasm
	npx tsx scripts/deploy_tokens_only.ts standalone

# Deploy tokens with custom network
deploy-tokens-network:
	@echo "🚀 Deploying tokens to $(NETWORK)..."
	@if [ ! -f "kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm" ]; then \
		echo "❌ Token WASM not found. Run 'make build' first."; \
		exit 1; \
	fi
	@if [ -z "$(NETWORK)" ]; then \
		echo "❌ Network not specified. Use: make deploy-tokens-network NETWORK=testnet"; \
		exit 1; \
	fi
	@cp kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm .soroban/token.wasm
	npx tsx scripts/deploy_tokens_only.ts $(NETWORK)

# Deploy KaleFi contract only (requires tokens)
deploy-kalefi:
	@echo "🚀 Deploying KaleFi contract..."
	@if [ ! -f "kalefi/target/wasm32-unknown-unknown/release/kalefi.wasm" ]; then \
		echo "❌ KaleFi WASM not found. Run 'make build' first."; \
		exit 1; \
	fi
	@cp kalefi/target/wasm32-unknown-unknown/release/kalefi.wasm .soroban/kalefi.wasm
	npx tsx scripts/deploy_kalefi.ts standalone

# Complete deployment
deploy-all:
	@echo "🚀 Starting complete deployment..."
	make build
	make deploy-tokens
	make deploy-kalefi
	@echo "✅ Complete deployment finished!"

# Deploy to standalone network
deploy-standalone:
	@echo "🌐 Deploying to standalone network..."
	make build
	@cp kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm .soroban/token.wasm
	@cp kalefi/target/wasm32-unknown-unknown/release/kalefi.wasm .soroban/kalefi.wasm
	npx tsx scripts/deploy_all.ts standalone

# Deploy to testnet network
deploy-testnet:
	@echo "🌐 Deploying to testnet network..."
	make build
	@cp kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm .soroban/token.wasm
	@cp kalefi/target/wasm32-unknown-unknown/release/kalefi.wasm .soroban/kalefi.wasm
	npx tsx scripts/deploy_all.ts testnet

# Deploy to futurenet network
deploy-futurenet:
	@echo "🌐 Deploying to futurenet network..."
	make build
	@cp kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm .soroban/token.wasm
	@cp kalefi/target/wasm32-unknown-unknown/release/kalefi.wasm .soroban/futurenet.wasm
	npx tsx scripts/deploy_all.ts futurenet

# Test the deployed protocol
test:
	@echo "🧪 Testing KaleFi Protocol..."
	@if [ ! -f ".soroban/standalone.contracts.json" ]; then \
		echo "❌ No contracts found. Deploy first using 'make deploy-standalone'"; \
		exit 1; \
	fi
	npx tsx scripts/test_protocol.ts standalone
	@echo "✅ Protocol test completed!"

# Test tokens only
test-tokens:
	@echo "🧪 Testing Tokens..."
	@if [ ! -f ".soroban/standalone.contracts.json" ]; then \
		echo "❌ No contracts found. Deploy tokens first using 'make deploy-tokens'"; \
		exit 1; \
	fi
	npx tsx scripts/test_tokens.ts standalone
	@echo "✅ Token test completed!"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	cd kalefi && cargo clean
	cd kalefi/soroban-examples/token && cargo clean
	rm -rf .soroban/*.wasm
	@echo "✅ Clean complete!"

# Show deployment status
status:
	@echo "📊 Deployment Status:"
	@echo "====================="
	@if [ -f ".soroban/standalone.contracts.json" ]; then \
		echo "Standalone: ✅ Configured"; \
	else \
		echo "Standalone: ❌ Not configured"; \
	fi
	@if [ -f ".soroban/testnet.contracts.json" ]; then \
		echo "Testnet: ✅ Configured"; \
	else \
		echo "Testnet: ❌ Not configured"; \
	fi
	@if [ -f ".soroban/futurenet.contracts.json" ]; then \
		echo "Futurenet: ✅ Configured"; \
	else \
		echo "Futurenet: ❌ Not configured"; \
	fi
	@echo ""
	@echo "Deployed contracts:"
	@if [ -f "deployments.json" ]; then \
		cat deployments.json | jq -r '.[] | "\(.contractId): \(.contractAddress)"' 2>/dev/null || echo "No deployments found"; \
	else \
		echo "No deployments found"; \
	fi