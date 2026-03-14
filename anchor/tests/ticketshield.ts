import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ticketshield } from "../target/types/ticketshield";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";

describe("ticketshield", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Ticketshield as Program<Ticketshield>;

  const organizer = provider.wallet;
  const fan = anchor.web3.Keypair.generate();
  const scalper = anchor.web3.Keypair.generate();

  const EVENT_NAME = "Test Concert";
  const FACE_PRICE = new anchor.BN(65_000_000);
  const MAX_RESALE_BPS = 11000;
  const TOTAL_SUPPLY = 10;

  before(async () => {
    await provider.connection.requestAirdrop(fan.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(scalper.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await new Promise(r => setTimeout(r, 1000));
  });

  const [eventPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("event"), organizer.publicKey.toBuffer(), Buffer.from(EVENT_NAME)],
    program.programId
  );

  const [ticketMintPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("ticket_mint"), eventPDA.toBuffer()],
    program.programId
  );

  it("Creates an event with correct parameters", async () => {
    await program.methods
      .createEvent(EVENT_NAME, TOTAL_SUPPLY, FACE_PRICE, MAX_RESALE_BPS)
      .accounts({
        event: eventPDA,
        ticketMint: ticketMintPDA,
        organizer: organizer.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc();

    const event = await program.account.event.fetch(eventPDA);
    assert.equal(event.name, EVENT_NAME);
    assert.equal(event.facePrice.toNumber(), FACE_PRICE.toNumber());
    assert.equal(event.maxResaleBps, MAX_RESALE_BPS);
    assert.equal(event.totalSupply, TOTAL_SUPPLY);
    assert.equal(event.ticketsSold, 0);
    assert.isTrue(event.isActive);
  });

  it("Allows a fan to purchase a ticket at face price", async () => {
    // TODO: wire once purchase_ticket is complete
  });

  // CRITICAL — Person B must make this pass
  it("REJECTS resale above the price cap", async () => {
    // TODO Person B: implement after buy_listed_ticket is complete
    // try {
    //   await program.methods.buyListedTicket().accounts({...}).rpc();
    //   assert.fail("Should have thrown ResalePriceTooHigh");
    // } catch (err) {
    //   assert.include(err.message, "ResalePriceTooHigh");
    // }
  });

  it("Allows legitimate resale within the price cap", async () => {
    // TODO Person B: implement after buy_listed_ticket is complete
  });
});