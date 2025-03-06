// use anchor_lang::prelude::*;
// use crate::state::Whitelist;

// pub fn add_to_whitelist(ctx: Context<ModifyWhitelist>, new_member: Pubkey) -> Result<()> {
//     let whitelist = &mut ctx.accounts.whitelist;

//     require!(
//         !whitelist.members.contains(&new_member),
//         CustomError::AlreadyWhitelisted
//     );

//     whitelist.members.push(new_member);
//     Ok(())
// }