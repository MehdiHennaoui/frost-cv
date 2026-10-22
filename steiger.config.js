import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
	...fsd.configs.recommended,
	{
		// TanStack Start file routes live in app/; not an FSD ui segment
		ignores: ["./src/app/routes/**", "./src/app/routeTree.gen.ts"],
	},
	{
		// shadcn drops components as files under shared/ui
		files: ["./src/shared/**"],
		rules: {
			"fsd/public-api": "off",
		},
	},
]);
