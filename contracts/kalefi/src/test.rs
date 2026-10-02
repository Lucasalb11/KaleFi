#![cfg(test)]
extern crate std;

use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};
use soroban_sdk::token::{StellarAssetClient, TokenClient};
use soroban_sdk::{Address, Env};

const ONE: i128 = 10_000_000; // 7 decimals

/// How a contract error surfaces from a `try_` call on a function that panics with it.
fn err(e: Error) -> Result<soroban_sdk::Error, soroban_sdk::InvokeError> {
    Ok(soroban_sdk::Error::from_contract_error(e as u32))
}

struct Setup {
    e: Env,
    market: KaleFiClient<'static>,
    kale: TokenClient<'static>,
    usdc: TokenClient<'static>,
    kale_admin: StellarAssetClient<'static>,
    usdc_admin: StellarAssetClient<'static>,
    admin: Address,
}

/// LTV 50%, KALE at 0.50 USDC, 10_000 USDC of liquidity in the market.
fn setup() -> Setup {
    let e = Env::default();
    e.mock_all_auths();
    e.ledger().with_mut(|l| l.timestamp = 1_000_000);

    let admin = Address::generate(&e);
    let kale_id = e.register_stellar_asset_contract_v2(admin.clone()).address();
    let usdc_id = e.register_stellar_asset_contract_v2(admin.clone()).address();
    let market_id = e.register(KaleFi, ());
    let market = KaleFiClient::new(&e, &market_id);
    market.init(&admin, &kale_id, &usdc_id, &5_000, &(ONE / 2));

    let usdc_admin = StellarAssetClient::new(&e, &usdc_id);
    usdc_admin.mint(&market_id, &(10_000 * ONE));

    Setup {
        kale: TokenClient::new(&e, &kale_id),
        usdc: TokenClient::new(&e, &usdc_id),
        kale_admin: StellarAssetClient::new(&e, &kale_id),
        usdc_admin,
        market,
        admin,
        e,
    }
}

fn user_with_kale(s: &Setup, amount: i128) -> Address {
    let u = Address::generate(&s.e);
    s.kale_admin.mint(&u, &amount);
    u
}

#[test]
fn init_cannot_be_called_twice() {
    let s = setup();
    let attacker = Address::generate(&s.e);
    let res = s.market.try_init(&attacker, &s.kale.address, &s.usdc.address, &9_000, &ONE);
    assert_eq!(res, Err(err(Error::AlreadyInitialized)));
    assert_eq!(s.market.get_config().admin, s.admin);
}

#[test]
fn borrows_up_to_the_ltv_and_no_further() {
    let s = setup();
    let u = user_with_kale(&s, 1_000 * ONE);
    s.market.deposit(&u, &(1_000 * ONE)); // worth 500 USDC, limit 250
    s.market.borrow(&u, &(250 * ONE));
    assert_eq!(s.usdc.balance(&u), 250 * ONE);
    assert_eq!(s.market.try_borrow(&u, &1), Err(err(Error::UnhealthyPosition)));
}

#[test]
fn rejects_zero_and_negative_amounts() {
    let s = setup();
    let u = user_with_kale(&s, 10 * ONE);
    assert_eq!(s.market.try_deposit(&u, &0), Err(err(Error::InvalidAmount)));
    assert_eq!(s.market.try_borrow(&u, &-5), Err(err(Error::InvalidAmount)));
}

#[test]
fn refuses_to_lend_on_a_stale_price() {
    let s = setup();
    let u = user_with_kale(&s, 1_000 * ONE);
    s.market.deposit(&u, &(1_000 * ONE));
    s.e.ledger().with_mut(|l| l.timestamp += MAX_PRICE_AGE + 1);
    assert_eq!(s.market.try_borrow(&u, &ONE), Err(err(Error::StalePrice)));
    // A debt-free position can still exit without a price.
    s.market.withdraw(&u, &(1_000 * ONE));
    assert_eq!(s.kale.balance(&u), 1_000 * ONE);
}

#[test]
fn withdrawal_keeps_the_position_healthy() {
    let s = setup();
    let u = user_with_kale(&s, 1_000 * ONE);
    s.market.deposit(&u, &(1_000 * ONE));
    s.market.borrow(&u, &(200 * ONE)); // needs 800 KALE at 50% LTV
    assert_eq!(s.market.try_withdraw(&u, &(201 * ONE)), Err(err(Error::UnhealthyPosition)));
    s.market.withdraw(&u, &(200 * ONE));
}

#[test]
fn liquidates_an_underwater_position_with_a_bonus() {
    let s = setup();
    let u = user_with_kale(&s, 1_000 * ONE);
    s.market.deposit(&u, &(1_000 * ONE));
    s.market.borrow(&u, &(250 * ONE));

    let liquidator = Address::generate(&s.e);
    s.usdc_admin.mint(&liquidator, &(1_000 * ONE));
    // Healthy positions can't be touched.
    assert_eq!(s.market.try_liquidate(&liquidator, &u, &ONE), Err(err(Error::PositionHealthy)));

    s.market.set_price(&(ONE * 4 / 10)); // KALE drops to 0.40
    // At most half the debt per call.
    assert_eq!(s.market.try_liquidate(&liquidator, &u, &(126 * ONE)), Err(err(Error::ExceedsCloseFactor)));

    let seized = s.market.liquidate(&liquidator, &u, &(100 * ONE));
    // 100 USDC / 0.40 = 250 KALE, +5% = 262.5 KALE
    assert_eq!(seized, 2_625_000_000);
    assert_eq!(s.kale.balance(&liquidator), seized);
    let p = s.market.get_position(&u);
    assert_eq!(p.debt, 150 * ONE);
    assert_eq!(p.collateral, 1_000 * ONE - seized);
}

#[test]
fn repay_cannot_exceed_debt() {
    let s = setup();
    let u = user_with_kale(&s, 1_000 * ONE);
    s.market.deposit(&u, &(1_000 * ONE));
    s.market.borrow(&u, &(10 * ONE));
    assert_eq!(s.market.try_repay(&u, &(11 * ONE)), Err(err(Error::RepayExceedsDebt)));
    s.market.repay(&u, &(10 * ONE));
    assert_eq!(s.market.get_position(&u).debt, 0);
}

#[test]
fn only_admin_sets_price() {
    let s = setup();
    s.e.set_auths(&[]);
    assert!(s.market.try_set_price(&ONE).is_err());
}
