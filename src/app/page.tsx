"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Copy, ChevronDown, Sparkles, Eye, Info } from "lucide-react";
import { generatePasswordFromSeed } from "@/lib/password-generator";
import { useOrbitport } from "@/hooks/useOrbitport";
import { Starfield } from "@/components/starfield";
import Image from "next/image";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/cipher";

interface PasswordResult {
  password: string;
  seed: string;
  usedFallback: boolean;
}

interface ApiError {
  message?: string;
}

export default function Home() {
  const { getRandomSeed } = useOrbitport();

  const [formData, setFormData] = useState({
    length: 16,
    minUpper: 2,
    minLower: 2,
    minNumbers: 2,
    minSymbols: 2,
  });

  const [characterTypes, setCharacterTypes] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [result, setResult] = useState<PasswordResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: string, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCharacterTypeChange = (type: string, checked: boolean) => {
    setCharacterTypes((prev) => ({ ...prev, [type]: checked }));

    // Reset minimum requirements to 0 when character type is unchecked
    if (!checked) {
      const fieldMap: { [key: string]: string } = {
        uppercase: "minUpper",
        lowercase: "minLower",
        numbers: "minNumbers",
        symbols: "minSymbols",
      };

      const fieldToReset = fieldMap[type];
      if (fieldToReset) {
        setFormData((prev) => ({ ...prev, [fieldToReset]: 0 }));
      }
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Fetch seed from API using the hook
      const seedResult = await getRandomSeed();

      // Generate password client-side using the seed
      const password = generatePasswordFromSeed(seedResult.data, {
        length: formData.length,
        minUpper: formData.minUpper,
        minLower: formData.minLower,
        minNumbers: formData.minNumbers,
        minSymbols: formData.minSymbols,
        includeUpper: characterTypes.uppercase,
        includeLower: characterTypes.lowercase,
        includeNumbers: characterTypes.numbers,
        includeSymbols: characterTypes.symbols,
      });

      setResult({
        password,
        seed: seedResult.data,
        usedFallback: seedResult.usedFallback,
      });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to generate password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result?.password) {
      try {
        await navigator.clipboard.writeText(result.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error("Failed to copy password");
      }
    }
  };

  // Calculate total minimum requirements ONLY for selected character types
  const totalMin =
    (characterTypes.uppercase ? formData.minUpper : 0) +
    (characterTypes.lowercase ? formData.minLower : 0) +
    (characterTypes.numbers ? formData.minNumbers : 0) +
    (characterTypes.symbols ? formData.minSymbols : 0);
  const isValid =
    totalMin <= formData.length && Object.values(characterTypes).some(Boolean);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0A0B1A] via-[#1C2526] to-[#0A0B1A] overflow-hidden text-white">
      <Starfield className="absolute inset-0 overflow-hidden" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-20">
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <Image
                src={`${basePath}/space-computer.svg`}
                alt="Space Computer Logo"
                width={142}
                height={48}
                className="mx-auto mb-4 w-full max-w-64"
              />
              <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                Orbitport Password Generator
              </CardTitle>
              <p className="text-gray-300 text-sm">
                Generate secure passwords using cosmic true random numbers
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Length */}
              <div className="space-y-2">
                <Label htmlFor="length" className="text-white">
                  Password Length: {formData.length}
                </Label>
                <Slider
                  id="length"
                  value={[formData.length]}
                  onValueChange={(value) =>
                    handleInputChange("length", value[0])
                  }
                  max={32}
                  min={8}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Character Type Selection */}
              <div className="space-y-3">
                <Label className="text-white text-sm font-medium">
                  Include Character Types:
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uppercase"
                      checked={characterTypes.uppercase}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleCharacterTypeChange("uppercase", checked === true)
                      }
                      className="border-white/20 data-[state=checked]:bg-[#FCD501] data-[state=checked]:border-[#FCD501]"
                    />
                    <Label htmlFor="uppercase" className="text-white text-sm">
                      A-Z (Uppercase)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="lowercase"
                      checked={characterTypes.lowercase}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleCharacterTypeChange("lowercase", checked === true)
                      }
                      className="border-white/20 data-[state=checked]:bg-[#FCD501] data-[state=checked]:border-[#FCD501]"
                    />
                    <Label htmlFor="lowercase" className="text-white text-sm">
                      a-z (Lowercase)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="numbers"
                      checked={characterTypes.numbers}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleCharacterTypeChange("numbers", checked === true)
                      }
                      className="border-white/20 data-[state=checked]:bg-[#FCD501] data-[state=checked]:border-[#FCD501]"
                    />
                    <Label htmlFor="numbers" className="text-white text-sm">
                      0-9 (Numbers)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="symbols"
                      checked={characterTypes.symbols}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleCharacterTypeChange("symbols", checked === true)
                      }
                      className="border-white/20 data-[state=checked]:bg-[#FCD501] data-[state=checked]:border-[#FCD501]"
                    />
                    <Label htmlFor="symbols" className="text-white text-sm">
                      !@#$%^&* (Symbols)
                    </Label>
                  </div>
                </div>
              </div>

              {/* Minimum Requirements - now inside Accordion */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="advanced-options">
                  <AccordionTrigger className="text-white text-sm font-medium flex justify-start items-center gap-2">
                    Advanced Options
                    <span className="flex items-center ml-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info
                            className="w-4 h-4 text-gray-300 hover:text-[#FCD501] cursor-pointer"
                            aria-label="What are minimum requirements?"
                            tabIndex={0}
                          />
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="max-w-xs text-white bg-black/90 border border-white/20"
                        >
                          Enter the minimum number of characters for each of
                          these categories. The password will include at least
                          this many of each type if possible.
                        </TooltipContent>
                      </Tooltip>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="minUpper"
                          className="text-white text-sm"
                        >
                          Uppercase Letters
                        </Label>
                        <Input
                          id="minUpper"
                          type="number"
                          value={formData.minUpper}
                          onChange={(e) =>
                            handleInputChange(
                              "minUpper",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={formData.length}
                          disabled={!characterTypes.uppercase}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#FCD501] focus:ring-[#FCD501]/20 disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="minLower"
                          className="text-white text-sm"
                        >
                          Lowercase Letters
                        </Label>
                        <Input
                          id="minLower"
                          type="number"
                          value={formData.minLower}
                          onChange={(e) =>
                            handleInputChange(
                              "minLower",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={formData.length}
                          disabled={!characterTypes.lowercase}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#FCD501] focus:ring-[#FCD501]/20 disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="minNumbers"
                          className="text-white text-sm"
                        >
                          Numbers
                        </Label>
                        <Input
                          id="minNumbers"
                          type="number"
                          value={formData.minNumbers}
                          onChange={(e) =>
                            handleInputChange(
                              "minNumbers",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={formData.length}
                          disabled={!characterTypes.numbers}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#FCD501] focus:ring-[#FCD501]/20 disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="minSymbols"
                          className="text-white text-sm"
                        >
                          Symbols
                        </Label>
                        <Input
                          id="minSymbols"
                          type="number"
                          value={formData.minSymbols}
                          onChange={(e) =>
                            handleInputChange(
                              "minSymbols",
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={formData.length}
                          disabled={!characterTypes.symbols}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-[#FCD501] focus:ring-[#FCD501]/20 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Validation Messages */}
              {!isValid && (
                <div className="text-red-400 text-sm text-center">
                  {!Object.values(characterTypes).some(Boolean)
                    ? "Please select at least one character type"
                    : "Minimum requirements exceed password length"}
                </div>
              )}

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !isValid}
                className="w-full bg-[#FCD501] hover:bg-yellow-400 text-black font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generate Password
                  </div>
                )}
              </Button>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                  {error}
                </div>
              )}

              {/* Result */}
              {result && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <Label className="text-white text-sm font-medium">
                        Generated Password
                      </Label>
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        variant="ghost"
                        className="text-[#FCD501] hover:text-yellow-300 hover:bg-yellow-400/10"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                    <div className="mt-2 p-3 bg-black/20 rounded border border-white/10">
                      <code className="text-green-400 font-mono text-sm break-all">
                        {result.password}
                      </code>
                    </div>
                  </div>

                  {/* Seed Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-white/20 text-white hover:bg-white/10 hover:border-[#FCD501]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Seed
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full bg-black/90 border-white/20 backdrop-blur-md">
                      <DropdownMenuItem className="text-xs font-mono text-gray-300 p-3">
                        <div className="break-all">{result.seed}</div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Fallback Warning */}
                  {result.usedFallback && (
                    <div className="text-yellow-400 text-sm text-center bg-yellow-900/20 p-3 rounded-lg border border-yellow-500/20">
                      ⚠️ Using fallback random generation (Orbitport API
                      unavailable)
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="text-center text-xs text-gray-400">
              <p>
                Powered by real satellites in orbit using Orbitport&apos;s
                cEDGE/Crypto2 technology for true cosmic randomness.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
