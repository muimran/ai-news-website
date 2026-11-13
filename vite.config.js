import { sveltekit } from '@sveltejs/kit/vite';
import { makeSizes } from './scripts/sizes.js';
import { makeStills } from './scripts/stills.js';

/* Make the picture sizes for any new upload, and the still for any new
   video without a picture: before a build, when the dev server starts, and
   when an editor adds a picture or a story while it runs. */
const sizes = {
  name: 'picture-sizes',
  async buildStart() {
    await makeSizes();
    await makeStills();
  },
  configureServer(server) {
    server.watcher.add('static/uploads');
    server.watcher.on('add', (file) => {
      if (/static[\\/]uploads[\\/][^\\/]+$/.test(file)) makeSizes();
    });
    server.watcher.on('change', (file) => {
      if (/static[\\/]uploads[\\/][^\\/]+$/.test(file)) makeSizes();
      if (/content[\\/]articles[\\/].*\.md$/.test(file)) makeStills();
    });
  }
};

export default {
  plugins: [sizes, sveltekit()],
  server: { port: 5177, strictPort: false }
};
