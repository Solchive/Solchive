use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct AppendData<'info> {
    #[account(mut, has_one = owner)]
    pub split_data: Account<'info, SplitData>,
    pub prev_data: Option<Account<'info, SplitData>>,
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>
}

pub fn append_data(ctx: Context<AppendData>, json_data:String, prev_id: String) -> Result<()> {
    let split_data = &mut ctx.accounts.split_data;

    split_data.owner = ctx.accounts.owner.key();
    split_data.data = json_data;
    if let Some(prev_account) = &ctx.accounts.prev_data {
        split_data.prev_id = Some(prev_id);
    } else {
        split_data.prev_id = None;
    }

    Ok(())
}