import * as anchor from "@project-serum/anchor";
import { BN, Program, Provider } from "@project-serum/anchor";
import { IDL, Seagull } from "./seagull_spot_v1";
import { Commitment, Connection, PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
import { Market, Side, User } from "./types";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findAssociatedTokenAddress, findUserAddress, getSideFromKey } from "./utils";
import { SeagullMarketProvider } from "./api";
import { randomBytes } from "crypto";

export class SeagullSocks extends SeagullMarketProvider<Seagull> {
    public constructor(
        connection: Connection,
        programId: PublicKey,
        program?: Program<Seagull>
    ) {
        super(connection, programId, program);
    }

    createProgram(programId: PublicKey, provider: Provider) {
        return new anchor.Program(IDL, programId, provider);
    }

    async fetchUser(
        address: PublicKey,
        commitment?: Commitment
    ): Promise<User> {
        return {
            ...(await this.program.account.user.fetch(address, commitment)),
            publicKey: address
        };
    }

    async fetchMarket(
        address: PublicKey,
        commitment?: Commitment
    ): Promise<Market> {
        return {
            ...(await this.program.account.market.fetch(address, commitment)),
            publicKey: address
        };
    }

    initMarket(
        payer: PublicKey,
        quoteMint: PublicKey,
        baseMint: PublicKey,
        quoteHoldingAccount: PublicKey,
        baseHoldingAccount: PublicKey,
    ) {
        return this.program.methods
            .initMarket()
            .accounts({
                payer: payer,
                quoteMint: quoteMint,
                baseMint: baseMint,
                quoteHoldingAccount: quoteHoldingAccount,
                baseHoldingAccount: baseHoldingAccount,
                systemProgram: SystemProgram.programId,
                tokenProgram: TOKEN_PROGRAM_ID
            })
            .instruction()
    }

    initUser(
        authority: PublicKey,
        market: Market,
        user_id: BN = new BN(randomBytes(8)),
        userAccount: PublicKey = findUserAddress(market.publicKey, user_id)
    ) {
        return this.program.methods
            .initUser(user_id)
            .accounts({
                authority: authority,
                market: market.publicKey,
                user: userAccount,
                systemProgram: SystemProgram.programId,
            })
            .instruction();
    }

    placeOrder(
        side: Side,
        amount: BN,
        lowest_price: BN,
        a_end: BN,
        market: Market,
        user: User
    ) {
        const [sideMintAddress, sideHoldingAccount] = "buy" in side ?
            [market.quoteMint, market.quoteHoldingAccount] : [market.baseMint, market.baseHoldingAccount];

        const assetAccount = findAssociatedTokenAddress(user.authority, sideMintAddress);

        return this.program.methods
            .placeOrder(amount, side, lowest_price, a_end)
            .accounts({
                authority: user.authority,
                user: user.publicKey,
                userSideAccount: assetAccount,
                sideMint: sideMintAddress,
                sideHoldingAccount: sideHoldingAccount,
                orderQueue: market.orderQueue,
                market: market.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: SYSVAR_CLOCK_PUBKEY
            })
            .instruction();
    }

    cancelOrder(
        order_id: BN,
        market: Market,
        user: User
    ) {
        const [sideMintAddress, sideHoldingAccount] = "buy" in getSideFromKey(order_id) ?
            [market.quoteMint, market.quoteHoldingAccount]
            : [market.baseMint, market.baseHoldingAccount];

        const refundAccount = findAssociatedTokenAddress(user.publicKey, sideMintAddress);

        return this.program.methods
            .cancelOrder(order_id)
            .accounts({
                authority: user.authority,
                user: user.publicKey,
                refundMint: sideMintAddress,
                refundAccount: refundAccount,
                marketHoldingAccount: sideHoldingAccount,
                orderQueue: market.orderQueue,
                market: market.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: SYSVAR_CLOCK_PUBKEY
            })
            .instruction();
    }

    settleOrder(
        order_id: BN,
        market: Market,
        user: User,
        filler: User
    ) {
        const [fillerSideMintAddress, userSideMintAddress] = "buy" in getSideFromKey(order_id) ?
            [market.quoteMint, market.baseMint]
            : [market.baseMint, market.quoteMint];

        const orderUserAccount = findAssociatedTokenAddress(user.authority, userSideMintAddress);
        const orderFillerAccount = findAssociatedTokenAddress(filler.authority, fillerSideMintAddress);

        return this.program.methods
            .settleOrder(order_id)
            .accounts({
                market: market.publicKey,
                baseMint: market.baseMint,
                quoteMint: market.quoteMint,
                baseHoldingAccount: market.baseHoldingAccount,
                quoteHoldingAccount: market.quoteHoldingAccount,
                orderQueue: market.orderQueue,
                orderUser: user.publicKey,
                orderUserAccount: orderUserAccount,
                orderFiller: filler.publicKey,
                orderFillerAccount: orderFillerAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: SYSVAR_CLOCK_PUBKEY
            })
            .instruction();
    }

    fillOrder(
        side: Side,
        max_size: BN,
        price: BN,
        expire_slot: BN,
        market: Market,
        filler: User,
    ) {
        const [sideMintAddress, sideHoldingAccount] = "buy" in side ?
             [market.quoteMint, market.quoteHoldingAccount] : [market.baseMint, market.baseHoldingAccount];

        const assetAccount = findAssociatedTokenAddress(filler.authority, sideMintAddress);

        return this.program.methods
            .fillOrder(side, max_size, price, expire_slot)
            .accounts({
                authority: filler.authority,
                filler: filler.publicKey,
                fillerSideAccount: assetAccount,
                sideHoldingAccount: sideHoldingAccount,
                sideMint: sideMintAddress,
                market: market.publicKey,
                orderQueue: market.orderQueue,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: SYSVAR_CLOCK_PUBKEY
            })
            .instruction();
    }

    claimUnsettled(
        market: Market,
        user: User,
    ) {
        const userQuoteAccount = findAssociatedTokenAddress(user.authority, market.quoteMint);
        const userBaseAccount = findAssociatedTokenAddress(user.authority, market.baseMint);

        return this.program.methods
            .claimUnsettled()
            .accounts({
                authority: user.authority,
                user: user.publicKey,
                userQuoteAccount: userQuoteAccount,
                quoteMint: market.quoteMint,
                userBaseAccount: userBaseAccount,
                baseMint: market.baseMint,
                baseHoldingAccount: market.baseHoldingAccount,
                quoteHoldingAccount: market.quoteHoldingAccount,
                orderQueue: market.orderQueue,
                market: market.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                clock: SYSVAR_CLOCK_PUBKEY
            })
            .instruction();
    }
}