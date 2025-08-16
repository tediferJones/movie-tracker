import { Config, Dependent } from '@/lib/hashCache/types';

// FIX ME
// This should be included in config
export async function hash(data: string) {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  const buffer = await crypto.subtle.digest('SHA-256', encodedData);
  const byteArray = Array.from(new Uint8Array(buffer));
  return byteArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function reverseDependencies(config: Config) {
  const dependents = new Set<string>();
  const revDeps = Object.keys(config).reduce((obj, key) => {
    if (config[key].dependent) {
      dependents.add(key);
      const dep = config[key].dependent!;
      obj[dep.name] = { name: key, key: dep.key };
    }
    return obj;
  }, {} as { [key: string]: Dependent });
  return { dependents, revDeps };
}
