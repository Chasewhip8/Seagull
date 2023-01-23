import { BN } from "@project-serum/anchor";
import { MarketSide, Side, User } from "./types";
import { BN_0, ID_RESERVED_SIDE_BIT, ID_SAFE_BITS, SEAGULL_PROGRAM_ID, U64_MAX_BN } from "./constants";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { SeagullMarketProvider } from "./api";

export function getKey(price: BN, side: Side, user_id: BN): BN {
    return price.ushln(64).ior(user_id).ior(getSideBit(side)); // Upper bits: price, Lower bits: user_id, 64th bit is side.
}

export function getSideBit(side: Side): BN {
    return "buy" in side ? ID_RESERVED_SIDE_BIT : BN_0; // TODO test this! MarketSide.Buy
}

export function getPriceFromKey(key: BN): BN {
    return key.ushrn(64);
}

export function getUserIdFromKey(key: BN): BN {
    return key.uand(U64_MAX_BN);
}

export function getSideFromKey(key: BN): Side {
    return getUserIdFromKey(key).iuand(ID_RESERVED_SIDE_BIT).eqn(0)
        ? MarketSide.Sell : MarketSide.Buy;
}

export function fp32FromNumber(amount: number): BN {
    return new BN(Math.floor(amount * (2 ** 32)));
}

export function fp32CalcMinTickSizes(baseDecimals: number): BN {
    return new BN(1).ishln(32 - baseDecimals)
}

export function tickAlignFloor(fp32Amount: BN, minTickSize: BN): BN {
    return fp32Amount.sub(fp32Amount.umod(minTickSize));
}

export function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [
            new PublicKey(walletAddress).toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            new PublicKey(tokenMintAddress).toBuffer()
        ],
        ASSOCIATED_PROGRAM_ID
    )[0];
}

export function findMarketAddress(baseMint: PublicKey, quoteMint: PublicKey){
    return findProgramAddressSync(
        [
            Buffer.from("Market"),
            quoteMint.toBuffer(),
            baseMint.toBuffer()
        ],
        SEAGULL_PROGRAM_ID
    )[0]
}

export function findUserAddress(market: PublicKey, user_id: BN){
    return findProgramAddressSync(
        [
            Buffer.from("User"),
            market.toBuffer(),
            user_id.toBuffer("le", 8)
        ],
        SEAGULL_PROGRAM_ID
    )[0]
}

export function findUserID(address: PublicKey, bump: number = 0){
    return new BN(address.toBuffer().slice(0, 7))
        .iand(ID_SAFE_BITS)
        .ishln(1)
        .ior(new BN(bump));
}

export async function findUser(sdk: SeagullMarketProvider<any>, market: PublicKey, authority: PublicKey, tryAttempts: number = 3, startBump: number = 0): Promise<User | number | null> {
    for (let i = 0; i < tryAttempts; i++){
        const bump = startBump + i;
        const id = findUserID(authority, bump);
        const address = findUserAddress(market, id);

        try {
            const user = await sdk.fetchUser(address);
            if (user.authority.equals(authority)){
                return user;
            }
        } catch (e) {
            return bump;
        }
    }
    return null;
}