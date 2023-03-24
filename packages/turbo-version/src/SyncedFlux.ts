import { cwd, exit } from "process";
import { formatTag, formatTagPrefix } from "./utils/FormatTag";
import { generateChangelog } from "./utils/GenerateChangelog";
import { generateVersion } from "./utils/GenerateVersion";
import { getLatestTag } from "./utils/GetLatestTag";
import { updatePackageVersion } from "./utils/UpdatePackageVersion";
import { gitProcess } from "@turbo-version/git";
import { Config } from "@turbo-version/setup";
import chalk from "chalk";
import { log } from "@turbo-version/log";
import { getPackagesSync } from "@manypkg/get-packages";
import { appendScripts } from "./utils/AppendScripts";

export async function syncedFlux(config: Config, type?: any) {
  try {
    const { packages, tool, rootDir } = getPackagesSync(cwd());

    const tagPrefix = formatTagPrefix({
      synced: config.synced,
    });
    const { preset, baseBranch: branch } = config;

    const latestTag = await getLatestTag(tagPrefix);

    const version = await generateVersion({
      latestTag,
      preset,
      tagPrefix,
      type,
    });

    if (typeof version === "string") {
      log(["new", `New version calculated ${version}`, "All"]);
      const nextTag = formatTag({ tagPrefix, version });

      for (const pkg of packages) {
        const { name } = pkg.packageJson;
        const path = pkg.relativeDir;

        await updatePackageVersion({ path, version, name });
        log(["paper", "Package version updated", name]);

        await generateChangelog({
          tagPrefix,
          preset,
          path,
          version,
          name,
        });
        log(["list", `Changelog generated`, name]);
      }

      console.log(
        `${tool.type ?? "npm"} release ${packages.reduce(
          (acc, ac) => (acc += ` ${ac.relativeDir}`),
          ""
        )}`
      );

      await gitProcess({ files: [cwd()], nextTag });
      log(["tag", `Git Tag generated for ${nextTag}.`, "All"]);

      if (config.appendScripts) {
        appendScripts(packages as any, rootDir, config.appendScripts, type);
      }
    } else {
      log(["success", "There is no change since the last release.", "All"]);
    }
  } catch (err: any) {
    log(["error", chalk.red(err.message), "Failure"]);
    exit(1);
  }
}
