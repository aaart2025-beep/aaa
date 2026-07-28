/**
 * Tiny module-level bridge so the home hero can hook into the global page
 * transition: before the glide-wipe runs, the hero rewinds its canvas scrubber
 * back to the "book closed" frame. On any page without a hero this is a no-op.
 */

type RewindFn = () => Promise<void>;

let rewindFn: RewindFn | null = null;

/** The hero registers its rewind routine; returns an unregister cleanup. */
export function registerRewind(fn: RewindFn): () => void {
  rewindFn = fn;
  return () => {
    if (rewindFn === fn) rewindFn = null;
  };
}

/** Run the registered rewind (resolves immediately if nothing is registered). */
export function runRewind(): Promise<void> {
  return rewindFn ? rewindFn() : Promise.resolve();
}
