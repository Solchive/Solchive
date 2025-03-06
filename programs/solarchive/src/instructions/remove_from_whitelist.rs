// use anchor_lang::prelude::*;
// use crate::state::Whitelist;

// pub fn remove_from_whitelist(ctx: Context<ModifyWhitelist>, member: Pubkey) -> Result<()> {
//     let whitelist = &mut ctx.accounts.whitelist;

//     require!(
//         whitelist.members.contains(&member),
//         CustomError::NotWhitelisted
//     );

//     whitelist.members.retain(|&x| x != member);
//     Ok(())
// }