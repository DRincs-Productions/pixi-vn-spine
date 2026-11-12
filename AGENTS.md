# Developing this Pixi'VN extension

This repository is a reusable library that extends `@drincs/pixi-vn`. Keep the library generic:
do not add game-specific story content, character names, asset aliases, or UI conventions to `src/`.
Prefer small, reusable public APIs and export public symbols from the appropriate `index.ts` files.

## Tests

Use Vitest for behavior that can be checked without a real browser. Tests belong in `tests/` and
should cover new features and bug fixes whenever their behavior is observable in Vitest. Run the
suite with:

```bash
npm test
```

The project also provides `npm run build`, `npm run lint`, and `npm run check` for build and code
quality checks. Keep tests focused on the library behavior rather than the example application.

## Playground

`playground/` is a small runnable app for trying this extension together with Pixi'VN. Use it to
exercise integration behavior that is awkward or impossible to verify in Vitest, such as actual
PixiJS rendering, browser timing, and visual interactions. It is a development and verification
tool, not part of the published library API.

Install its dependencies with `npm run playground:install`, then start it with
`npm run playground:dev`. For a production-style build and preview, use `npm run playground:preview`.
When a change depends on real browser behavior, add or update a focused playground example and
inspect the result in the browser. Chrome DevTools MCP can be used to inspect and interact with the
running Playground when that MCP server is available in the agent environment: start the dev server,
open its local URL in the MCP-controlled browser, and use screenshots, DOM inspection, console and
network logs, and browser interactions to verify rendering and behavior live. It complements Vitest
for browser-only behavior; it does not replace Vitest, and it is unavailable unless Chrome DevTools
MCP is configured and connected.

## Project skills

As the project develops, add a root `skills/` directory with project-specific `SKILL.md` files that
explain the extension's public APIs and common development workflows in clear, actionable language
for AI coding agents. Create or update a skill when a feature introduces non-obvious usage,
conventions, or setup steps that an agent would need in another project. Keep skills specific to
this extension, accurate to the current source, and written in English. This directory is optional;
the skill validation workflow skips its checks until at least one `skills/<name>/SKILL.md` exists.

Validate the skill files before release with:

```bash
npm run skills:validate
```

Each skill should live in its own `skills/<name>/SKILL.md` directory and include the required
frontmatter described by `scripts/validate-skills.mjs`.
Create `skills/getting-started/SKILL.md` as the main entry point. Add `skills/categories.json` to map
every skill name to a category, following `~/lib/pixi-vn/skills/categories.json` and the rules in
`scripts/validate-skills.mjs`. Split additional skills by API or workflow category when requested.
If the extension has an Ink submodule, ask the user whether they want a separate Ink skill before
creating one.
