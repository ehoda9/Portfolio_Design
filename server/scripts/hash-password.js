import bcrypt from 'bcryptjs';

// Run this locally to generate ADMIN_PASSWORD_HASH for your .env file.
// Never commit the plaintext password or paste it anywhere else — only
// the hash this prints goes into .env.
//
//   npm run hash-password -- 'your-password-here'

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- <password>');
  process.exitCode = 1;
} else {
  const hash = bcrypt.hashSync(password, 12);
  console.log(hash);
}
