#![no_std]
//! KaleFi: borrow USDC against KALE collateral.
//!
//! One isolated market. Positions live in persistent storage per user. The KALE
//! price comes from a feed the admin updates; every borrow, withdrawal and
//! liquidation refuses a price older than `MAX_PRICE_AGE`. Unhealthy positions
//! can be liquidated by anyone, who repays part of the debt and receives the
//! equivalent collateral plus a bonus.

use soroban_sdk::{contract, contracterror, contractimpl, contracttype, panic_with_error, token, Address, Env};

/// 100% in basis points.
const BPS: i128 = 10_000;
/// Prices carry 7 decimals, like Stellar assets.
const PRICE_SCALE: i128 = 10_000_000;
/// Reject prices older than this (seconds).
pub const MAX_PRICE_AGE: u64 = 3_600;
/// A liquidator may repay at most this share of a position's debt per call.
pub const CLOSE_FACTOR_BPS: i128 = 5_000;
/// Extra collateral a liquidator receives on top of the repaid value.
pub const LIQUIDATION_BONUS_BPS: i128 = 500;

const DAY_IN_LEDGERS: u32 = 17_280;
const TTL_BUMP: u32 = 30 * DAY_IN_LEDGERS;
const TTL_THRESHOLD: u32 = TTL_BUMP - DAY_IN_LEDGERS;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    InvalidLtv = 4,
    StalePrice = 5,
    InvalidPrice = 6,
    UnhealthyPosition = 7,
    InsufficientCollateral = 8,
    RepayExceedsDebt = 9,
    PositionHealthy = 10,
    ExceedsCloseFactor = 11,
    Overflow = 12,
}

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub admin: Address,
    pub kale: Address,
    pub usdc: Address,
    /// Max borrow as a share of collateral value.
    pub ltv_bps: u32,
}

#[contracttype]
#[derive(Clone)]
pub struct Price {
    /// USDC per KALE, 7 decimals.
    pub value: i128,
    pub updated_at: u64,
}

#[contracttype]
#[derive(Clone, Default)]
pub struct Position {
    pub collateral: i128,
    pub debt: i128,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Config,
    Price,
    Position(Address),
}

#[contract]
pub struct KaleFi;

fn config(e: &Env) -> Config {
    e.storage()
        .instance()
        .get(&DataKey::Config)
        .unwrap_or_else(|| panic_with_error!(e, Error::NotInitialized))
}

fn fresh_price(e: &Env) -> i128 {
    let price: Price = e
        .storage()
        .instance()
        .get(&DataKey::Price)
        .unwrap_or_else(|| panic_with_error!(e, Error::StalePrice));
    if e.ledger().timestamp().saturating_sub(price.updated_at) > MAX_PRICE_AGE {
        panic_with_error!(e, Error::StalePrice);
    }
    price.value
}

fn position(e: &Env, user: &Address) -> Position {
    e.storage().persistent().get(&DataKey::Position(user.clone())).unwrap_or_default()
}

fn save_position(e: &Env, user: &Address, p: &Position) {
    let key = DataKey::Position(user.clone());
    if p.collateral == 0 && p.debt == 0 {
        e.storage().persistent().remove(&key);
    } else {
        e.storage().persistent().set(&key, p);
        e.storage().persistent().extend_ttl(&key, TTL_THRESHOLD, TTL_BUMP);
    }
    e.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_BUMP);
}

fn positive(e: &Env, amount: i128) {
    if amount <= 0 {
        panic_with_error!(e, Error::InvalidAmount);
    }
}

fn mul_div(e: &Env, a: i128, b: i128, c: i128) -> i128 {
    a.checked_mul(b).unwrap_or_else(|| panic_with_error!(e, Error::Overflow)) / c
}

/// Health factor in bps: 10_000 means the debt is exactly at the borrowing limit.
fn health_bps(e: &Env, p: &Position, price: i128, ltv_bps: u32) -> i128 {
    if p.debt == 0 {
        return i128::MAX;
    }
    let collateral_value = mul_div(e, p.collateral, price, PRICE_SCALE);
    let limit = mul_div(e, collateral_value, ltv_bps as i128, BPS);
    mul_div(e, limit, BPS, p.debt)
}

fn write_price(e: &Env, value: i128) {
    if value <= 0 {
        panic_with_error!(e, Error::InvalidPrice);
    }
    e.storage().instance().set(&DataKey::Price, &Price { value, updated_at: e.ledger().timestamp() });
    e.storage().instance().extend_ttl(TTL_THRESHOLD, TTL_BUMP);
}

#[contractimpl]
impl KaleFi {
    /// Sets the market up once. Calling it again fails, so nobody can take over admin.
    pub fn init(e: Env, admin: Address, kale: Address, usdc: Address, ltv_bps: u32, initial_price: i128) {
        if e.storage().instance().has(&DataKey::Config) {
            panic_with_error!(&e, Error::AlreadyInitialized);
        }
        admin.require_auth();
        if ltv_bps == 0 || ltv_bps as i128 >= BPS {
            panic_with_error!(&e, Error::InvalidLtv);
        }
        e.storage().instance().set(&DataKey::Config, &Config { admin, kale, usdc, ltv_bps });
        write_price(&e, initial_price);
    }

    /// Admin price update. Stands in for an oracle until KALE has a Reflector feed.
    pub fn set_price(e: Env, price: i128) {
        config(&e).admin.require_auth();
        write_price(&e, price);
    }

    pub fn deposit(e: Env, user: Address, amount: i128) {
        user.require_auth();
        positive(&e, amount);
        let cfg = config(&e);
        token::Client::new(&e, &cfg.kale).transfer(&user, &e.current_contract_address(), &amount);
        let mut p = position(&e, &user);
        p.collateral = p.collateral.checked_add(amount).unwrap_or_else(|| panic_with_error!(&e, Error::Overflow));
        save_position(&e, &user, &p);
    }

    pub fn borrow(e: Env, user: Address, amount: i128) {
        user.require_auth();
        positive(&e, amount);
        let cfg = config(&e);
        let mut p = position(&e, &user);
        p.debt = p.debt.checked_add(amount).unwrap_or_else(|| panic_with_error!(&e, Error::Overflow));
        if health_bps(&e, &p, fresh_price(&e), cfg.ltv_bps) < BPS {
            panic_with_error!(&e, Error::UnhealthyPosition);
        }
        save_position(&e, &user, &p);
        token::Client::new(&e, &cfg.usdc).transfer(&e.current_contract_address(), &user, &amount);
    }

    pub fn repay(e: Env, user: Address, amount: i128) {
        user.require_auth();
        positive(&e, amount);
        let cfg = config(&e);
        let mut p = position(&e, &user);
        if amount > p.debt {
            panic_with_error!(&e, Error::RepayExceedsDebt);
        }
        token::Client::new(&e, &cfg.usdc).transfer(&user, &e.current_contract_address(), &amount);
        p.debt -= amount;
        save_position(&e, &user, &p);
    }

    pub fn withdraw(e: Env, user: Address, amount: i128) {
        user.require_auth();
        positive(&e, amount);
        let cfg = config(&e);
        let mut p = position(&e, &user);
        if amount > p.collateral {
            panic_with_error!(&e, Error::InsufficientCollateral);
        }
        p.collateral -= amount;
        // No debt means no price is needed: users can always exit a debt-free position.
        if p.debt > 0 && health_bps(&e, &p, fresh_price(&e), cfg.ltv_bps) < BPS {
            panic_with_error!(&e, Error::UnhealthyPosition);
        }
        save_position(&e, &user, &p);
        token::Client::new(&e, &cfg.kale).transfer(&e.current_contract_address(), &user, &amount);
    }

    /// Repay up to half of an unhealthy position's debt and receive the same
    /// value in KALE plus a 5% bonus, capped at the position's collateral.
    pub fn liquidate(e: Env, liquidator: Address, user: Address, repay_amount: i128) -> i128 {
        liquidator.require_auth();
        positive(&e, repay_amount);
        let cfg = config(&e);
        let price = fresh_price(&e);
        let mut p = position(&e, &user);
        if health_bps(&e, &p, price, cfg.ltv_bps) >= BPS {
            panic_with_error!(&e, Error::PositionHealthy);
        }
        if repay_amount > mul_div(&e, p.debt, CLOSE_FACTOR_BPS, BPS) {
            panic_with_error!(&e, Error::ExceedsCloseFactor);
        }

        let collateral_for_repay = mul_div(&e, repay_amount, PRICE_SCALE, price);
        let seized = mul_div(&e, collateral_for_repay, BPS + LIQUIDATION_BONUS_BPS, BPS).min(p.collateral);

        token::Client::new(&e, &cfg.usdc).transfer(&liquidator, &e.current_contract_address(), &repay_amount);
        p.debt -= repay_amount;
        p.collateral -= seized;
        save_position(&e, &user, &p);
        token::Client::new(&e, &cfg.kale).transfer(&e.current_contract_address(), &liquidator, &seized);
        seized
    }

    // ---- reads ------------------------------------------------------------

    pub fn get_position(e: Env, user: Address) -> Position {
        position(&e, &user)
    }

    /// (collateral value in USDC, debt, health factor in bps). Uses the stored
    /// price even if stale, so the UI can still show where a position stands.
    pub fn check_health_factor(e: Env, user: Address) -> (i128, i128, i128) {
        let cfg = config(&e);
        let price: Price = e.storage().instance().get(&DataKey::Price).unwrap();
        let p = position(&e, &user);
        (mul_div(&e, p.collateral, price.value, PRICE_SCALE), p.debt, health_bps(&e, &p, price.value, cfg.ltv_bps))
    }

    pub fn get_price(e: Env) -> Price {
        e.storage().instance().get(&DataKey::Price).unwrap()
    }

    pub fn get_config(e: Env) -> Config {
        config(&e)
    }
}

#[cfg(test)]
mod test;
