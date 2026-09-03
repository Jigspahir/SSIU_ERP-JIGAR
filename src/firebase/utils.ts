/**
 * Wraps a promise with a fast timeout (default 350ms) to ensure non-blocking fallback
 * when running offline, in test environments, or behind firewalls.
 */
export async function withFirestoreTimeout<T>(promise: Promise<T>, timeoutMs: number = 350): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Firestore request timed out after ${timeoutMs}ms (offline fallback)`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}
