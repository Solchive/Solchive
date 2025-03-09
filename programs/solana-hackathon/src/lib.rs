use anchor_lang::prelude::*;

declare_id!("D3FVceibAfCXFfk2q94MVseCCJVsXsXtJM7B7ykgYSi6");

#[program]
pub mod solchive {
    use super::*;

    pub fn create_whitelist(ctx: Context<WhitelistAccounts>, name: String, user: Pubkey) -> Result<()> {
        let whitelist = &mut ctx.accounts.whitelist_account;
        whitelist.name = name;

        whitelist.users.push(user);
    
        Ok(())
    }

    pub fn rename_whitelist(ctx: Context<UpdateAccount>, name: String) -> Result<()> {
        let whitelist_account = &mut ctx.accounts.whitelist_account;
        let signer = ctx.accounts.signer.key();

        require!(
            whitelist_account.users.contains(&signer),
            WhitelistError::Unauthorized
        );
        
        ctx.accounts.whitelist_account.name = name;

        Ok(())
    }

    pub fn add_whitelist(ctx: Context<UpdateAccount>, user: Pubkey) -> Result<()> {
        let whitelist_account = &mut ctx.accounts.whitelist_account;
        let signer = ctx.accounts.signer.key();

        require!(
            whitelist_account.users.contains(&signer),
            WhitelistError::Unauthorized
        );

        if !whitelist_account.users.contains(&user) {
            whitelist_account.users.push(user);
        }

        Ok(())
    }

    pub fn delete_whitelist(ctx: Context<UpdateAccount>, user: Pubkey) -> Result<()> {
        let whitelist_account = &mut ctx.accounts.whitelist_account;
        let signer = ctx.accounts.signer.key();

        require!(
            whitelist_account.users.contains(&signer),
            WhitelistError::Unauthorized
        );

        whitelist_account.users.retain(|&x| x != user);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct WhitelistAccounts<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 14 + 164 + 10,
        seeds = [b"whitelist_seed", owner.key.as_ref()],
        bump,
    )]
    pub whitelist_account: Account<'info, Whitelist>,

    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAccount<'info> {
    #[account(mut)]
    pub whitelist_account: Account<'info, Whitelist>,

    /// CHECK: This account is only used for signature verification. No data is read or written from this account.
    #[account(signer)]
    pub signer: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct Whitelist {
    name: String,
    users: Vec<Pubkey>,
}

#[error_code]
pub enum WhitelistError {
    #[msg("Unauthorized: Only whitelist members can update this whitelist.")]
    Unauthorized,
}

