use anchor_lang::prelude::*;

#[account]
pub struct SplitData { // 압축된 String buffer 가 저장될 곳
    pub owner: Pubkey,
    pub data: String,
    pub prev_id: Option<String>, // 이전 트랜잭션 id
}
#[account]
pub struct SharedDatabase { // 해당 데이터의 정보가 저장될 곳
    pub owner: Pubkey,
    pub last_id: Pubkey, // 실제 데이터가 저장된 account id
    pub name: String, // 테이블 이름
    pub data_type: String, // 데이터 종류
    // pub whitelist: Pubkey, // 해당 데이터의 삭제 권한을 가지고 있는 wallet list
    pub created_at: i64,
}

// Whitelist
// #[account]
// pub struct Whitelist {
//     pub members: BTreeSet<Pubkey>,  // Whitelisted 지갑 목록
// }
// impl Whitelist {
//     pub fn is_whitelisted(&self, user: &Pubkey) -> bool {
//         self.members.contains(user)
//     }
// }

// Pool
// #[account]
// pub struct RewardPool {
//     pub balance: u64,      // Pool 내 보유 SOL
//     pub whitelist: Pubkey, // Whitelisted 유저만 접근 가능
// }