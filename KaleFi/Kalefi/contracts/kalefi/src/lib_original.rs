#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env
};
use soroban_sdk::token;

const SCALE_BPS: i128 = 10_000; // 100% = 10000 bps

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    KaleToken,        // Address do SAC (ou token contrato) do KALE
    UsdcToken,        // Address do token/USDC
    LtvBps,           // u32 em bps (ex: 5000 = 50%)
    UseMock,          // bool
    MockPrice,        // i128 preço simulado (no mesmo "decimals" escolhido)
    Collateral(Address), // garantia do usuário em KALE (em unidades de token)
    Debt(Address),       // dívida do usuário em USDC (em unidades de token)
}

#[contract]
pub struct KaleFi;

#[contractimpl]
impl KaleFi {
    /// Inicializa o protocolo
    /// - ltv_bps: ex. 5000 = 50%
    /// - use_mock_oracle: true para testes locais sem Oracle
    pub fn init(
        e: Env,
        admin: Address,
        kale_token: Address,
        usdc_token: Address,
        ltv_bps: u32,
        use_mock_oracle: bool,
    ) {
        admin.require_auth();
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::KaleToken, &kale_token);
        e.storage().instance().set(&DataKey::UsdcToken, &usdc_token);
        e.storage().instance().set(&DataKey::LtvBps, &ltv_bps);
        e.storage().instance().set(&DataKey::UseMock, &use_mock_oracle);
        // preço mock padrão = 0
        e.storage().instance().set(&DataKey::MockPrice, &0i128);
    }

    /// (Dev) Define um preço mockado p/ testes locais
    pub fn set_mock_price(e: Env, price: i128) {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        e.storage().instance().set(&DataKey::MockPrice, &price);
    }

    /// Deposita KALE como colateral
    pub fn deposit(e: Env, from: Address, amount: i128) {
        from.require_auth();
        let kale: Address = e.storage().instance().get(&DataKey::KaleToken).unwrap();
        // transfere do usuário para o contrato
        let kale_client = token::Client::new(&e, &kale);
        kale_client.transfer(&from, &e.current_contract_address(), &amount);

        // credita saldo de colateral
        let k = DataKey::Collateral(from.clone());
        let prev: i128 = e.storage().instance().get(&k).unwrap_or(0);
        e.storage().instance().set(&k, &(prev + amount));
    }

    /// Checa o Health Factor do usuário.
    /// Retorna (collateral_value, debt_value, hf_bps)
    pub fn check_health_factor(e: Env, user: Address) -> (i128, i128, i128) {
        // saldos
        let coll_amt: i128 = e.storage().instance().get(&DataKey::Collateral(user.clone())).unwrap_or(0);
        let debt_amt:  i128 = e.storage().instance().get(&DataKey::Debt(user.clone())).unwrap_or(0);

        if debt_amt == 0 {
            return (0, 0, i128::MAX); // sem dívida → HF "infinito"
        }

        // preço do KALE no ativo-base do oracle (ex: USD) com "decimals"
        let (price, decimals) = Self::get_kale_price(&e);

        // Valor do colateral = coll_amt * price / 10^decimals
        let ten: i128 = 10;
        let denom = ten.pow(decimals as u32);
        let collateral_value = coll_amt
            .checked_mul(price).expect("overflow")
            / denom;

        // Aplica LTV
        let ltv_bps: u32 = e.storage().instance().get(&DataKey::LtvBps).unwrap();
        let max_borrow_value = collateral_value
            .checked_mul(ltv_bps as i128).expect("overflow")
            / SCALE_BPS;

        // Considera a dívida já existente como "valor" no mesmo base
        let debt_value = debt_amt; // assumindo USDC 1:1 com base do oracle nos testes

        // HF = max_borrow_value / debt_value (em bps, 10000 = saudável no limite)
        let hf_bps = max_borrow_value
            .checked_mul(SCALE_BPS).expect("overflow")
            / debt_value;

        (collateral_value, debt_value, hf_bps)
    }

    /// Realiza empréstimo em USDC, se HF pós‑empréstimo ≥ 10000 bps
    pub fn borrow(e: Env, to: Address, amount: i128) {
        to.require_auth();

        // Calcula HF hipotético após novo empréstimo
        let curr_debt: i128 = e.storage().instance().get(&DataKey::Debt(to.clone())).unwrap_or(0);
        let new_debt = curr_debt + amount;

        // Checa HF com a nova dívida
        {
            // grava temporariamente e calcula
            e.storage().instance().set(&DataKey::Debt(to.clone()), &new_debt);
            let (_, _, hf_bps) = Self::check_health_factor(e.clone(), to.clone());
            // volta ao valor anterior (se falhar, não altera estado)
            e.storage().instance().set(&DataKey::Debt(to.clone()), &curr_debt);

            // exige HF >= 100%
            if hf_bps < SCALE_BPS {
                panic!("Health factor too low to borrow");
            }
        }

        // Atualiza dívida
        e.storage().instance().set(&DataKey::Debt(to.clone()), &new_debt);

        // (Opcional produção) transferir USDC do contrato para o usuário
        // Para testes locais você pode pular isso ou pré-fundir o contrato.
        let usdc: Address = e.storage().instance().get(&DataKey::UsdcToken).unwrap();
        let usdc_client = token::Client::new(&e, &usdc);
        usdc_client.transfer(&e.current_contract_address(), &to, &amount);
    }

    // ----------------- helpers -----------------

    fn get_kale_price(e: &Env) -> (i128, u32) {
        let use_mock: bool = e.storage().instance().get(&DataKey::UseMock).unwrap();
        if use_mock {
            let p: i128 = e.storage().instance().get(&DataKey::MockPrice).unwrap();
            // por padrão assumimos decimals=7 (Stellar) no mock
            return (p, 7);
        }
        // Para produção, aqui você integraria com um oracle real
        // Por enquanto, sempre usa mock para simplicidade
        let p: i128 = e.storage().instance().get(&DataKey::MockPrice).unwrap_or(0);
        return (p, 7);
    }
}
