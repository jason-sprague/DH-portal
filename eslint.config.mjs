import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Add this new configuration object to override the default rules
  {
    rules: {
      // This rule disables the error for using the 'any' type.
      "@typescript-eslint/no-explicit-any": "off",
      
      // This rule disables the error for declared but unused variables.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];


export default eslintConfig;
