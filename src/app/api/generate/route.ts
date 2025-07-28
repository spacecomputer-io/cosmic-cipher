import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getValidToken } from "@/lib/auth";

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

interface PasswordResult {
  password: string;
  seed: string;
  usedFallback: boolean;
}

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNPQRSTUVWXYZ", // Excluding O
  lowercase: "abcdefghijklmnopqrstuvwxyz", // Excluding l
  numbers: "23456789", // Excluding 0 and 1
  symbols: "!@#$%^&*+-=",
};

const ORBITPORT_API_URL = process.env.ORBITPORT_API_URL;

async function fetchOrbitPortSeed(): Promise<string> {
  if (!ORBITPORT_API_URL) {
    throw new Error("Missing OrbitPort API URL");
  }

  try {
    // Get valid token using our auth utility
    const accessToken = await getValidToken({} as any, {} as any);
    if (!accessToken) {
      throw new Error("Authentication failed");
    }

    // Call downstream API with access token
    const response = await fetch(`${ORBITPORT_API_URL}/api/v1/services/trng`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OrbitPort API error:", errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.seed || data.data?.seed;
  } catch (error) {
    console.error("OrbitPort API error:", error);
    throw error;
  }
}

function generatePasswordFromSeed(
  seed: string,
  params: GenerateParams
): string {
  // Convert hex seed to bytes for crypto.getRandomValues
  const seedBytes = new Uint8Array(Buffer.from(seed, "hex"));

  // Create a deterministic random number generator from the seed
  const randomValues = (length: number): Uint8Array => {
    const result = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      result[i] = seedBytes[i % seedBytes.length];
    }
    return result;
  };

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const params: GenerateParams = {
      length: parseInt(searchParams.get("length") || "16"),
      minUpper: parseInt(searchParams.get("minUpper") || "2"),
      minLower: parseInt(searchParams.get("minLower") || "2"),
      minNumbers: parseInt(searchParams.get("minNumbers") || "2"),
      minSymbols: parseInt(searchParams.get("minSymbols") || "2"),
      includeUpper: searchParams.get("includeUpper") !== "false",
      includeLower: searchParams.get("includeLower") !== "false",
      includeNumbers: searchParams.get("includeNumbers") !== "false",
      includeSymbols: searchParams.get("includeSymbols") !== "false",
    };

    // Validate parameters
    if (params.length < 8 || params.length > 32) {
      return NextResponse.json(
        { error: "Password length must be between 8 and 32 characters" },
        { status: 400 }
      );
    }

    if (
      params.minUpper < 0 ||
      params.minLower < 0 ||
      params.minNumbers < 0 ||
      params.minSymbols < 0
    ) {
      return NextResponse.json(
        { error: "Minimum requirements cannot be negative" },
        { status: 400 }
      );
    }

    // Check if at least one character type is selected
    if (
      !params.includeUpper &&
      !params.includeLower &&
      !params.includeNumbers &&
      !params.includeSymbols
    ) {
      return NextResponse.json(
        { error: "At least one character type must be selected" },
        { status: 400 }
      );
    }

    const totalMin =
      params.minUpper + params.minLower + params.minNumbers + params.minSymbols;
    if (totalMin > params.length) {
      return NextResponse.json(
        { error: "Minimum requirements exceed password length" },
        { status: 400 }
      );
    }

    let seed: string;
    let usedFallback = false;

    try {
      seed = await fetchOrbitPortSeed();
    } catch (error) {
      console.warn("Using fallback random generation:", error);
      seed = crypto.randomBytes(32).toString("hex");
      usedFallback = true;
    }

    const password = generatePasswordFromSeed(seed, params);

    const result: PasswordResult = {
      password,
      seed,
      usedFallback,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Password generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate password" },
      { status: 500 }
    );
  }
}
