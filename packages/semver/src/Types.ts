export type Config = {
  tagPrefix: string;
  preset: string;
  baseBranch: string;
  synced: boolean;
  packages: string[];
  updateInternalDependencies:
    | "major"
    | "minor"
    | "patch"
    | "no-internal-update";
  strategy: "first-release" | "next-release" | "last-release";
};

export type PkgJson = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
