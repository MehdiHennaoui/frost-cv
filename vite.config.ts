import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub project Pages: set BASE_PATH=/frost-cv in the deploy workflow only.
const basePath = process.env.BASE_PATH?.replace(/\/$/, "") ?? "";

const config = defineConfig({
	base: basePath ? `${basePath}/` : "/",
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		tailwindcss(),
		tanstackStart({
			srcDirectory: "src/app",
			spa: { enabled: true },
			...(basePath ? { router: { basepath: basePath } } : {}),
		}),
		viteReact(),
	],
});

export default config;
