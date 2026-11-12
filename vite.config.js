import { sveltekit } from '@sveltejs/kit/vite';
import { makeSizes } from './scripts/sizes.js';

/* Make the picture sizes for any new upload: before a build, when the dev
   server starts, and when an editor adds a picture while it runs. */
const sizes = {
  name: 'picture-sizes',
  async buildStart() {
    await makeSizes();
  },
  configureServer(server) {
    server.watcher.add('static/uploads');
    server.watcher.on('add', (file) => {
      if (/static[\\/]uploads[\\/][^\\/]+$/.test(file)) makeSizes();
    });
    server.watcher.on('change', (file) => {
      if (/static[\\/]uploads[\\/][^\\/]+$/.test(file)) makeSizes();
    });
  }
};

export default {
  plugins: [sizes, sveltekit()],
  server: { port: 5177, strictPort: false }
};
