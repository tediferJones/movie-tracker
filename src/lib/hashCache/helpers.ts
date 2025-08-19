import { Config, Dependent } from '@/lib/hashCache/types';

export function reverseDependencies(config: Config) {
  const dependents = new Set<string>();
  const revDeps = Object.keys(config.resources).reduce((obj, key) => {
    if (config.resources[key].dependent) {
      dependents.add(key);
      const dep = config.resources[key].dependent!;
      obj[dep.name] = { name: key, key: dep.key };
    }
    return obj;
  }, {} as { [key: string]: Dependent });
  return { dependents, revDeps };
}
