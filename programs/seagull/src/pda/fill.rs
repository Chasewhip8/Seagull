use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct Filler {
    pub authority: Pubkey,
    pub market: Pubkey,

    pub base_account: Pubkey,
    pub base_locked: u64,

    pub quote_account: Pubkey,
    pub quote_locked: u64
}

impl Filler {
    pub const LEN: usize = 8  // Anchor Account Discriminator
        + 32 // authority: Pubkey
        + 32 // market: Pubkey
        + 32 // base_account: Pubkey
        + 8  // base_locked: u64
        + 32 // quote_account: Pubkey
        + 8  // quote_locked: u64
    ;

    pub fn seeds<'a>(owner: &'a Pubkey, market: &'a Pubkey) -> Vec<&'a[u8]> {
        vec![owner.as_ref(), market.as_ref()]
    }

    pub fn find_program_address(quote_mint: &Pubkey, base_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        let seeds = Self::seeds(quote_mint, base_mint);
        Pubkey::find_program_address(
            seeds.as_slice(),
            program_id,
        )
    }
}