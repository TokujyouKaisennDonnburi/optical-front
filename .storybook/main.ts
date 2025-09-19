import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import react from "@vitejs/plugin-react";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  stories: [
    "../src/components/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-links",
    "@storybook/addon-interactions",
  ],
  docs: { autodocs: "tag" },
  viteFinal: async (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve?.alias || {}),
      "@": path.resolve(__dirname, "../src"),
    } as any;
    // Ensure React automatic JSX runtime
    config.plugins = [
      ...(config.plugins || []),
      react({ jsxRuntime: "automatic" }),
    ];
    return config;
  },
};

export default config;
