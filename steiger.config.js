import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
	...fsd.configs.recommended,
	{
		// TanStack Start file routes live in app/; not an FSD ui segment
		ignores: ["./src/app/routes/**", "./src/app/routeTree.gen.ts"],
	},
	{
		// Prefer direct module imports over barrel index.ts (Vite / bundle cost).
		files: ["./src/shared/**", "./src/entities/**", "./src/pages/**"],
		rules: {
			"fsd/public-api": "off",
		},
	},
]);
