interface GenerateParams {
  length: number;
  minUpper: number;
  minLower: number;
  minNumbers: number;
  minSymbols: number;
  includeUpper: boolean;
  includeLower: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNPQRSTUVWXYZ", // Excluding O
  lowercase: "abcdefghijklmnopqrstuvwxyz", // Excluding l
  numbers: "23456789", // Excluding 0 and 1
  symbols: "!@#$%^&*+-=",
};

/**
 * Creates a deterministic random number generator from a seed
 */
function createRandomGenerator(seed: string) {
  const seedBytes = new Uint8Array(Buffer.from(seed, "hex"));
  let position = 0;

  return (length: number): Uint8Array => {
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = seedBytes[position % seedBytes.length];
      position++;
    }
    return result;
  };
}

/**
 * Generates a password from a seed with the specified parameters
 */
export function generatePasswordFromSeed(
  seed: string,
  params: GenerateParams
): string {
  const randomValues = createRandomGenerator(seed);

  const {
    length,
    minUpper,
    minLower,
    minNumbers,
    minSymbols,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
  } = params;

  // Build available character sets based on user selection
  const availableCharsets: { [key: string]: string } = {};
  if (includeUpper) availableCharsets.uppercase = CHARSETS.uppercase;
  if (includeLower) availableCharsets.lowercase = CHARSETS.lowercase;
  if (includeNumbers) availableCharsets.numbers = CHARSETS.numbers;
  if (includeSymbols) availableCharsets.symbols = CHARSETS.symbols;

  // Ensure at least one character type is selected
  if (Object.keys(availableCharsets).length === 0) {
    throw new Error("At least one character type must be selected");
  }

  // Calculate total minimum requirements
  const totalMin = minUpper + minLower + minNumbers + minSymbols;
  if (totalMin > length) {
    throw new Error("Minimum requirements exceed password length");
  }

  // Validate that minimum requirements don't exceed available character types
  if (minUpper > 0 && !includeUpper) {
    throw new Error(
      "Uppercase minimum requirement specified but uppercase not included"
    );
  }
  if (minLower > 0 && !includeLower) {
    throw new Error(
      "Lowercase minimum requirement specified but lowercase not included"
    );
  }
  if (minNumbers > 0 && !includeNumbers) {
    throw new Error(
      "Numbers minimum requirement specified but numbers not included"
    );
  }
  if (minSymbols > 0 && !includeSymbols) {
    throw new Error(
      "Symbols minimum requirement specified but symbols not included"
    );
  }

  let password = "";
  const remainingLength = length - totalMin;

  // Add minimum required characters
  for (let i = 0; i < minUpper; i++) {
    const randomIndex = randomValues(1)[0] % availableCharsets.uppercase.length;
    password += availableCharsets.uppercase[randomIndex];
  }

  for (let i = 0; i < minLower; i++) {
    const randomIndex = randomValues(1)[0] % availableCharsets.lowercase.length;
    password += availableCharsets.lowercase[randomIndex];
  }

  for (let i = 0; i < minNumbers; i++) {
    const randomIndex = randomValues(1)[0] % availableCharsets.numbers.length;
    password += availableCharsets.numbers[randomIndex];
  }

  for (let i = 0; i < minSymbols; i++) {
    const randomIndex = randomValues(1)[0] % availableCharsets.symbols.length;
    password += availableCharsets.symbols[randomIndex];
  }

  // Fill remaining length with random characters from all available sets
  const allAvailableChars = Object.values(availableCharsets).join("");
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = randomValues(1)[0] % allAvailableChars.length;
    password += allAvailableChars[randomIndex];
  }

  // Shuffle the password
  const passwordArray = password.split("");
  for (let i = passwordArray.length - 1; i > 0; i--) {
    const j = randomValues(1)[0] % (i + 1);
    [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
  }

  return passwordArray.join("");
}
