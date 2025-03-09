use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CreateDatabase<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 4 + 100 + 4 + 100 + 32 + 4 + 100
    )]
    pub database: Account<'info, SharedDatabase>,

    // pub last_split_data: Account<'info, SplitData>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn create_database(ctx: Context<CreateDatabase>, name: String, data_type: String, last_id: Pubkey) -> Result<()> {
    let database = &mut ctx.accounts.database;

    database.owner = ctx.accounts.owner.key();
    database.name = name;
    database.data_type = data_type;
    database.last_id = last_id;
    database.created_at = Clock::get()?.unix_timestamp;

    Ok(())
}