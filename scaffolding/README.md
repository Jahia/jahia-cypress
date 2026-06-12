# Cypress Scaffolding

This folder contains a **fully working Cypress codebase** used as the default scaffolding for Cypress test projects at Jahia.

## Purpose

This scaffolding is consumed by [jahia-cli](https://github.com/Jahia/jahia-cli) as a remote Cypress scaffolding template. When a user creates or initializes a Cypress environment via `jahia-cli`, the contents of this folder are synced locally into their project.

Because of this, **every file in this folder must remain functional and consistent** — it is not just a reference, it is the actual codebase that gets pulled and used as-is.

## Get Started

### Initialize a new Cypress project using `jahia-cli`

You can initialize a new Cypress project using the following command:

```
npx @jahia/jahia-cli@latest init -c jahia-cli.config.yml
```

Follow the prompts to set up your project, the process will generate a `jahia-cli.config.yml` file containing details about the envionment to be started and the scaffolding to be used.

It will also offer to launch the environment once the initialization is done and execute the single test contained in the scaffolding.

### Fetch the scaffolding into an existing project

If your project is already initialized (i.e. you already have a `jahia-cli.config.yml`), you can fetch all of the tests file using the following command:

```
npx @jahia/jahia-cli@latest tests:init -c jahia-cli.config.yml
```

This will sync the contents of the `scaffolding/` folder into your local project, allowing you to use it as a base for your tests.

### Update to a newer version of the scaffolding

The scaffolding is versioned via git tags. To update your local scaffolding to a newer version, simply change the `version` field in your `jahia-cli.config.yml` to the desired tag and run the init command again:

```yaml
tests:
  scaffolding:
    repository: https://github.com/Jahia/jahia-cypress
    path: scaffolding/
    version: 8.1.0
```

Then run the tests:init command to sync the files.

```
npx @jahia/jahia-cli@latest tests:init -c jahia-cli.config.yml
```

### Build and run the tests container

From the scaffolding folder, you can create the environment, build the tests container and run the tests using the following commands:

```bash
npx @jahia/jahia-cli@latest environment:create
npx @jahia/jahia-cli@latest tests:build -c jahia-cli.config.yml --context .
npx @jahia/jahia-cli@latest tests:run -c jahia-cli.config.yml --env JAHIA_HOST=jahia --env JAHIA_URL=http://jahia:8080
```

## Environment Variables

Environment variables are managed via `set-env.sh` (sourced with `source set-env.sh`):

1. If a `.env` file exists, it is sourced as the primary source of truth.
2. Any `.env.example*` files are then processed — variables not already set in the environment are exported with their default values.

This ensures that all required variables are available while allowing local overrides via `.env`.

## Important

- **Do not break this codebase.** Since `jahia-cli` syncs it directly, any issue here will propagate to all consumers.
- **Keep dependencies up to date** in `package.json` to reflect what Jahia Cypress projects need.
- Changes to this folder should be tested as a standalone Cypress project before merging.
