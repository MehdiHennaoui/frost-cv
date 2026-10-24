import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
	...fsd.configs.recommended,
	{
		// Generated router tree only — keep app/routes visible so entity usage counts
		ignores: ["./src/app/routeTree.gen.ts"],
	},
]);
