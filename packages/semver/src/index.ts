#!/usr/bin/env node

import { Command, Option } from "commander";
//@ts-ignore
import packageJson from "../package.json";
import { asyncFlux } from "./AsyncFlux";
import { getFoldersWithCommits } from "./GitCommands";
import { filterPackages } from "./GetDependents";
import { setup } from "./Setup";
import { singleFlux } from "./SingleFlux";
import { syncedFlux } from "./SyncedFlux";

const program = new Command();

program
  .name("Turbo Semver")
  .description("Semver Turborepo")
  .version(packageJson.version);

program.option("-t, --target <project>", "project you want to bump version");

program
  .addOption(
    new Option("-b, --bump <version>", "next version").choices([
      "patch",
      "minor",
      "major",
      "premajor",
      "preminor",
      "prepatch",
      "prerelease",
    ])
  )
  .description(
    "Version the application by default, following the semver.config.json specifications"
  )
  .action(async (options) => {
    const config = await setup();
    if (config.synced) {
      if (options.bump) {
        return syncedFlux(config, options.bump);
      }
      return syncedFlux(config);
    }

    if (options.bump) {
      if (options.target) {
        return singleFlux(config, options);
      }
      return asyncFlux(config, options.bump);
    }

    return asyncFlux(config);
  });

program.parse();

/**
 * Async mode
 * pnpm semver -b minor -t ui -> bump a specific package version, defined by args -b, and -t.
 * pnpm semver -b minor -> bump all packages versions, defined by arg -b.
 * pnpm semver -> bump all packages versions affected by commits since last release.
 */

/**
 * Synced mode
 * pnpm semver -> bump all packages versions for all packages in synced mode.
 * pnpm semver -> bump all packages versions affected by commits since last release.
 */
