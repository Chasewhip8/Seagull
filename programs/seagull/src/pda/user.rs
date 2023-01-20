use std::mem;
use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct User {
    pub authority: Pubkey,
    pub user_id: u64
}

impl User {
    pub const LEN: usize = 40;
    const _LEN_CHECK: [u8; User::LEN] = [0; mem::size_of::<User>()];
}