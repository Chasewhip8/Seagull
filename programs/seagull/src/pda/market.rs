use anchor_lang::prelude::*;
use sokoban::{Critbit};

#[account]
#[derive(Default, Debug)]
pub struct Market {
    pub quote_mint: Pubkey,
    pub base_mint: Pubkey,

    pub order_queue: Pubkey // Pubkey of CritBit order queue
}

#[account(zero_copy)]
#[repr(packed)] // TODO maybe remove this might not be needed? maybe #[repr(transparent)]
pub struct OrderQueue {
    pub queue: Critbit<Pubkey, 10, 10>
}

impl Market {
    pub const LEN: usize =
        8  // Anchor Account Discriminator
            + 32 // quote_mint: Pubkey
            + 32 // base_mint: Pubkey
    ;

    pub fn seeds<'a>(quote_mint: &'a Pubkey, base_mint: &'a Pubkey) -> Vec<&'a[u8]> {
        vec![quote_mint.as_ref(), base_mint.as_ref()]
    }

    pub fn find_program_address(quote_mint: &Pubkey, base_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
        let seeds = Self::seeds(quote_mint, base_mint);
        Pubkey::find_program_address(
            seeds.as_slice(),
            program_id,
        )
    }
}