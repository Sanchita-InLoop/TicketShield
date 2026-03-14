// Person A: replace PROGRAM_ID after anchor deploy
// Then copy anchor/target/idl/ticketshield.json -> frontend/src/idl/ticketshield.json

export const PROGRAM_ID = "11111111111111111111111111111111";
export const DEVNET_RPC = "https://api.devnet.solana.com";
export const DEMO_FACE_PRICE_LAMPORTS = 65_000_000;
export const DEMO_MAX_RESALE_BPS = 11000;
export const DEMO_TICKET_SUPPLY = 10;
export const DEMO_EVENT_NAME = "Coldplay India — Mumbai";

export const lamportsToSol = (lamports: number): number => lamports / 1_000_000_000;
export const solToLamports = (sol: number): number => Math.round(sol * 1_000_000_000);
export const bpsToPercent = (bps: number): number => bps / 100;