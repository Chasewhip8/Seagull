import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Seaguil } from "../target/types/seaguil";

describe("seaguil", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Seaguil as Program<Seaguil>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
