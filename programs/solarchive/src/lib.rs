use anchor_lang::prelude::*;
use anchor_lang::context::Context;

pub mod state;
pub mod instructions;

use instructions::*;

declare_id!("5YNGLpTaGqUiamL1pW59dPCBZFMfc65oiwZ4X5JJ7EDM");

#[program]
pub mod solarchive {
    use super::*;

    pub fn initialize_data(ctx: Context<InitializeData>) -> Result<()> {
        instructions::initialize_data(ctx)
    }

    pub fn append_data(ctx: Context<AppendData>, json_data: String, prev_id: String) -> Result<()> {
        instructions::append_data(ctx, json_data, prev_id)
    }

    pub fn create_database(ctx: Context<CreateDatabase>, name: String, data_type: String, last_id: Pubkey) -> Result<()> {
        instructions::create_database(ctx, name, data_type, last_id)
    }

    pub fn create_whitelist(ctx: Context<WhitelistAccounts>, name: String, user: Pubkey) -> Result<()> {
        instructions::whitelist::create_whitelist(ctx, name, user)
    }
    
    pub fn rename_whitelist(ctx: Context<UpdateAccount>, name: String) -> Result<()> {
        instructions::whitelist::rename_whitelist(ctx, name)
    }
    
    pub fn add_whitelist(ctx: Context<UpdateAccount>, user: Pubkey) -> Result<()> {
        instructions::whitelist::add_whitelist(ctx, user)
    }
    
    pub fn delete_whitelist(ctx: Context<UpdateAccount>, user: Pubkey) -> Result<()> {
        instructions::whitelist::delete_whitelist(ctx, user)
    }
}

