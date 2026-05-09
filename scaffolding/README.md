# Cypress Scaffolding

This folder contains a **fully working Cypress codebase** used as the default scaffolding for Cypress test projects at Jahia.

## Purpose

This scaffolding is consumed by [jahia-cli](https://github.com/Jahia/jahia-cli) as a remote Cypress scaffolding template. When a user creates or initializes a Cypress environment via `jahia-cli`, the contents of this folder are synced locally into their project.

Because of this, **every file in this folder must remain functional and consistent** — it is not just a reference, it is the actual codebase that gets pulled and used as-is.

## Structure

| File / Folder       | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `cypress.config.ts` | Cypress configuration                                             |
| `package.json`      | Dependencies and scripts                                          |
| `tsconfig.json`     | TypeScript configuration                                          |
| `cypress/`          | Test specs, plugins, and support files                            |
| `set-env.sh`        | Loads environment variables from `.env` and `.env.example*` files |
| `.env.example*`     | Example environment variable files with defaults                  |
| `ci.build.sh`       | CI build script                                                   |
| `ci.startup.sh`     | CI startup script                                                 |
| `ci.postrun.sh`     | CI post-run script                                                |
| `env.run.sh`        | Script to run the test environment                                |
| `env.debug.sh`      | Script to run the environment in debug mode                       |

## Environment Variables

Environment variables are managed via `set-env.sh` (sourced with `source set-env.sh`):

1. If a `.env` file exists, it is sourced as the primary source of truth.
2. Any `.env.example*` files are then processed — variables not already set in the environment are exported with their default values.

This ensures that all required variables are available while allowing local overrides via `.env`.

## Important

- **Do not break this codebase.** Since `jahia-cli` syncs it directly, any issue here will propagate to all consumers.
- **Keep dependencies up to date** in `package.json` to reflect what Jahia Cypress projects need.
- Changes to this folder should be tested as a standalone Cypress project before merging.
