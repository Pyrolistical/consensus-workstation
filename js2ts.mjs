import { join, basename } from 'path';
import { readdir, rename, open } from 'fs/promises';
import * as R from 'ramda';

const [,, dir] = process.argv;

await walk(dir);

async function walk(dir) {
  const files = await readdir(dir, {
    withFileTypes: true
  });
  for (const file of files) {
    const fullpath = join(dir, file.name);
    if (file.isDirectory()) {
      await walk(fullpath);
    } else {
      if (fullpath.endsWith('.js')) {
        const targetName = `${R.dropLast(3, fullpath)}.ts`;
        await rename(fullpath, targetName);
      }
    }
  }
}
