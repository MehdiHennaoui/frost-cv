<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Project rules (always apply)

These rules apply on every task, for any agent. Source of truth: `.agents/rules/`. Read each file and follow it.

- [English only](.agents/rules/english-only.md)
- [FSD CLI scaffolding](.agents/rules/fsd-cli.md)
- [Git branch naming](.agents/rules/git-branch-naming.md)
- [Lint after edits](.agents/rules/lint-after-edits.md)
- [React conditional render](.agents/rules/react-conditional-render.md)
