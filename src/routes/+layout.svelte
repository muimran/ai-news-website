<script>
  import '../app.css';
  import { onNavigate } from '$app/navigation';

  /* No theme JS. Dark mode follows the device: app.css keys off
     prefers-color-scheme, so there is nothing to store, stamp or hydrate. */
  let { children } = $props();

  /* View transitions.

     SvelteKit routes on the client, so this is the same-document API — the
     CSS-only `@view-transition { navigation: auto }` opt-in applies to real
     page loads, which we never do. Feature-detected: browsers without it fall
     straight through to an ordinary instant navigation. */
  onNavigate((navigation) => {
    if (!document.startViewTransition) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

{@render children()}
