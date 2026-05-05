import { SimplePool, type Event, type Filter } from 'nostr-tools';
import { DEFAULT_RELAYS } from '@/lib/constants';

export function subscribeFeed(
  onEvent: (e: Event) => void,
  onEose: () => void,
): () => void {
  const pool = new SimplePool();
  const filter: Filter = { kinds: [1], '#t': ['discerned'], limit: 50 };
  const sub = pool.subscribeMany(
    [...DEFAULT_RELAYS],
    filter,
    { onevent: onEvent, oneose: onEose },
  );
  return () => {
    sub.close();
    pool.close([...DEFAULT_RELAYS]);
  };
}
