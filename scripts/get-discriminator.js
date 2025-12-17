import crypto from 'crypto';

// Anchor discriminators = first 8 bytes of sha256("global:<instruction_name>")
const instructions = ['subscribe', 'request_redeem', 'initialize_mint'];

instructions.forEach(name => {
  const hash = crypto.createHash('sha256').update(`global:${name}`).digest();
  const discriminator = Array.from(hash.slice(0, 8));
  console.log(`${name} discriminator:`, discriminator);
});
