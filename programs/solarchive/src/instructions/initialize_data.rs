use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct InitializeData<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 4 + 1000 + 1 + 4 + 1000 // 8(discriminator) + 32(Pubkey) + 4+1000(String) + 1+4+1000(Option<String>)
    )]
    pub split_data: Account<'info, SplitData>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn initialize_data(ctx: Context<InitializeData>) -> Result<()> {
    let split_data = &mut ctx.accounts.split_data;
    split_data.owner = ctx.accounts.owner.key();
    split_data.data = String::new();
    split_data.prev_id = None;
    Ok(())
}