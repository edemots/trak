const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateRandomString(length: number): string {
  const alphabet = ALPHABET;
  const alphabetLength = alphabet.length;

  const mask = (1 << Math.floor(Math.log2(alphabetLength))) - 1;

  const step = Math.ceil((length * 1.5 * Math.log(256)) / Math.log(alphabetLength));

  let result = "";

  while (result.length < length) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(step));

    for (const byte of randomBytes) {
      const index = byte & mask;
      if (index < alphabetLength) {
        result += alphabet[index];
        if (result.length === length) {
          break;
        }
      }
    }
  }

  return result;
}
