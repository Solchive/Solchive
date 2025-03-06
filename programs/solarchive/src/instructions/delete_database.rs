// use anchor_lang::prelude::*;
// use crate::state::SharedDatabase;

// pub fn delete_database(ctx: Context<DeleteDatabase>) -> Result<()> {
//     let database = &ctx.accounts.database;
//     let whitelist = &ctx.accounts.whitelist;
//     let signer = ctx.accounts.signer.key;

//     // 서명자가 화이트리스트에 있는지 확인
//     require!(
//         whitelist.members.contains(signer),
//         CustomError::NotWhitelisted
//     );

//     // Rent Fee 환급을 위해 SOL을 Pool에 추가
//     let rent_refund = Rent::get()?.minimum_balance(database.to_account_info().data_len());
//     let pool = &mut ctx.accounts.pool;
//     pool.balance += rent_refund;

//     // 계정 삭제 처리
//     **database.to_account_info().lamports.borrow_mut() = 0;

//     Ok(())
// }