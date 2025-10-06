import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import vueParser from "vue-eslint-parser";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
  // Global ignores
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.tauri/**",
      "**/src-tauri/target/**",
      "**/.vscode/**",
      "**/.husky/**",
    ],
  },

  // Base config
  js.configs.recommended,

  // Vue files
  ...vue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: typescriptParser,
        extraFileExtensions: [".vue"],
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      // Allow component names like Button/Input/Dialog used across the project
      "vue/no-reserved-component-names": "off",
      // Use TS-aware unused-vars and disable base rules inside SFCs
      "no-unused-vars": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },

  // TypeScript files
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.cts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      // Rely on TS type checking instead of base no-undef
      "no-undef": "off",
    },
  },

  // JavaScript files
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },

  // Node.js scripts
  {
    files: ["scripts/**/*.js", "*.config.js", "*.config.ts"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
  },

  // Browser environment
  {
    files: ["src/**/*.ts", "src/**/*.vue"],
    languageOptions: {
      globals: {
        fetch: "readonly",
        RequestInit: "readonly",
        console: "readonly",
        window: "readonly",
        document: "readonly",
        URLSearchParams: "readonly",
        Response: "readonly",
        FormData: "readonly",
        File: "readonly",
        Blob: "readonly",
        Headers: "readonly",
        XMLHttpRequest: "readonly",
        FileReader: "readonly",
        Image: "readonly",
        navigator: "readonly",
        Event: "readonly",
        ClipboardEvent: "readonly",
        DragEvent: "readonly",
        DataTransfer: "readonly",
        FileList: "readonly",
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        FocusEvent: "readonly",
        KeyboardEvent: "readonly",
        WheelEvent: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        Node: "readonly",
        HTMLElement: "readonly",
        MouseEvent: "readonly",
      },
    },
  },

  // Prettier integration
  prettierConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },
];
