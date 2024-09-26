use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("FF3rAPgQdAjDHgTCqVH2TKcWH4ey6d5AyqAH5ZvwxFWb");

#[program]
mod journal {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
        data: String,
        price: String,
        members: String,
    ) -> Result<()> {
        msg!("Journal Entry Created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);
        msg!("Data: {}", data);
        msg!("Price: {}", price);
        msg!("Members: {}", members);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        journal_entry.data = data;
        journal_entry.price = price;
        // 初始化时，成员列表为空
        journal_entry.members = "".to_string();
        Ok(())
    }

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        title: String,
        message: String,
        data: String,
        price: String,
        members: String,
    ) -> Result<()> {
        msg!("Journal Entry Updated");
        msg!("Title: {}", title);
        msg!("Message: {}", message);
        msg!("Data: {}", data);
        msg!("Price: {}", price);
        msg!("Members: {}", members);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;
        journal_entry.data = data;
        journal_entry.price = price;
        journal_entry.members = members;

        Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, title: String) -> Result<()> {
        msg!("Journal entry titled {} deleted", title);
        Ok(())
    }
}

#[account]
pub struct JournalEntryState {
    pub owner: Pubkey,
    pub title: String,
    pub message: String,
    pub data: String,
    pub price: String,
    pub members: String,
}

#[derive(Accounts)]
#[instruction(title: String, message: String, data: String, price: String, members: String)]
pub struct CreateEntry<'info> {
    #[account(
        init,
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        payer = owner, 
        space = 8 + 32 + 4 + title.len() + 4 + message.len() + 4 + data.len() + 4 + price.len() + 4 + members.len()
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String, message: String, data: String, price: String, members: String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        realloc = 8 + 32 + 4 + title.len() + 4 + message.len() + 4 + data.len() + 4 + price.len() + 4 + members.len(),
        realloc::payer = owner, 
        realloc::zero = true, 
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account( 
        mut, 
        seeds = [title.as_bytes(), owner.key().as_ref()], 
        bump, 
        close= owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
