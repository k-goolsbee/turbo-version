import { generateAllChangelogs } from "./GenerateChangelog";
import { generateVersion } from "./GenerateVersion";
import { getLastTag, gitProcess } from "./GitCommands";
import { log } from "./Log";
import { Config } from "./Types";
import { updateAllPackagesVersion } from "./UpdatePackageVersion";

export async function syncedFlux(config: Config) {
  try {
    const latestVersion = await getLastTag("Workspace");
    const nextVersion = await generateVersion(
      latestVersion,
      config.preset,
      config.tagPrefix
    );
    const nextTag = `${config.tagPrefix}${nextVersion}`;

    await updateAllPackagesVersion(config.packages, nextVersion);
    await generateAllChangelogs(config.packages, config.preset, latestVersion);

    await gitProcess(["."], nextTag);

    log({
      step: "tag_success",
      message: `New Version ${nextTag}`,
      projectName: "Workspace",
    });
  } catch (err: any) {
    if (err) {
      throw err;
    }
  }
}
