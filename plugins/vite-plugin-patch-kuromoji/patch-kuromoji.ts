import { Plugin } from 'vite';
import { writeFile } from 'fs/promises';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';

const sourcePath = 'node_modules/kuromoji/build/kuromoji.js';
const patchedModulesPath = 'patched_modules';

const runPlugin = async () => {
  if (existsSync(patchedModulesPath + '/kuromoji.js')) return;
  console.log("Kuromoji module patch wasn't found, patching...");

  const source = await readFile(sourcePath, { encoding: 'utf-8' });
  const patchedSource = source.split('\n').map((line, index) => {
    // Bind kuromoji to local variable instead of global scope
    if (index === 0) return 'let kuromoji;\n' + line.replace('g.kuromoji = f()', 'kuromoji = f()');

    // For some reason, Vite unpacks the .gz archives in dev, but not in prod
    if (index === 8126)
      return `
        if (process.env.NODE_ENV === 'production') {
            var gz = new zlib.Zlib.Gunzip(new Uint8Array(arraybuffer));
            var typed_array = gz.decompress();
        } else {
            var typed_array = new Uint8Array(arraybuffer);
        }`;
    if (index === 8127) return '';

    return line;
  });
  patchedSource.push('export default kuromoji;\n');

  if (!existsSync(patchedModulesPath)) await mkdir(patchedModulesPath);
  await writeFile(patchedModulesPath + '/kuromoji.js', patchedSource.join('\n'));
  console.log(`Patched module has been written to '${patchedModulesPath}/kuromoji.js'`);
};

export const patchKuromoji = (): Plugin => ({
  name: 'patch-kuromoji',
  buildStart: runPlugin,
});
