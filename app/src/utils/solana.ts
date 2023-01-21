import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Connection, PublicKey } from "@solana/web3.js";
import { web3 } from '@project-serum/anchor';

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);

export async function getTokenAccountBalance(
    address: string,
    connection: Connection
): Promise<number> {
    const balance = await connection.getTokenAccountBalance(new PublicKey(address), "finalized");
    if (!balance) {
        return 0;
    }
    return balance.value.uiAmount;
}

/**
 * Derives the ATA address for a specific wallet address and mint.
 *
 * @param walletAddress the users wallet address
 * @param tokenMintAddress the token mint for the ATA
 */
export async function findAssociatedTokenAddress(
    walletAddress: string,
    tokenMintAddress: string
): Promise<PublicKey> {
    return (await web3.PublicKey.findProgramAddress(
        [
            new PublicKey(walletAddress).toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            new PublicKey(tokenMintAddress).toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    ))[0];
}

/**
 * Derives the ATA address for a specific wallet address and mint.
 *
 * @param walletAddress the users wallet address
 * @param tokenMintAddress the token mint for the ATA
 */
export function findAssociatedTokenAddressSync(
    walletAddress: string,
    tokenMintAddress: string
): PublicKey {
    return web3.PublicKey.findProgramAddressSync(
        [
            new PublicKey(walletAddress).toBuffer(),
            TOKEN_PROGRAM_ID.toBuffer(),
            new PublicKey(tokenMintAddress).toBuffer(),
        ],
        SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )[0];
}