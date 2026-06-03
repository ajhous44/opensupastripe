import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "public/**",
      "**/*.traineddata",
      "**/*.sql",
      "**/*.json",
      "**/*.md",
      "test-semantic-search.js",
      "test-webhook.js",
      "next-env.d.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "error",

      // React specific rules
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-unescaped-entities": "off",
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/react-in-jsx-scope": "off", // Not needed in React 17+

      // General best practices
      "no-console": ["warn", { allow: ["warn", "error", "log", "debug", "info"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "warn",
      "prefer-const": "error",
      "no-var": "error",

      // Code style
      "object-shorthand": "error",
      "prefer-destructuring": [
        "warn",
        {
          array: true,
          object: true,
        },
      ],

      // Next.js specific
      "@next/next/no-img-element": "warn",
      "@next/next/no-html-link-for-pages": "warn",

      // Performance
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/globals": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
    },
  },
];

export default eslintConfig;
