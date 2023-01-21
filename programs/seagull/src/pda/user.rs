use std::mem;
use anchor_lang::prelude::*;
use crate::pda::Side;
use crate::pda::Side::{Buy, Sell};

#[account]
#[derive(Default, Debug)]
pub struct User {
    pub authority: Pubkey,
    pub user_id: u64,

    // Needed only in scenarios where the order was forcibly canceled.
    pub open_quote: u64,
    pub open_base: u64,
}

impl User {
    pub const LEN: usize = 56;
    const _LEN_CHECK: [u8; User::LEN] = [0; mem::size_of::<User>()];
    
    pub fn add_to_side(&mut self, amount: u64, side: Side){
        match side { 
            Buy => {
                self.open_quote += amount;
            }
            Sell => {
                self.open_base += amount;
            }
        }
    }

    pub fn remove_from_side(&mut self, amount: u64, side: Side){
        match side {
            Buy => {
                self.open_quote += amount;
            }
            Sell => {
                self.open_base += amount;
            }
        }
    }
}