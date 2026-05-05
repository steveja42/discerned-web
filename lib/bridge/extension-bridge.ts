// Origin-pinned postMessage bridge between the Discerned Chrome extension and this page.
// The extension content script runs on discerned.online/* and announces itself with
// DISCERNED_BRIDGE_HELLO then pushes clips via DISCERNED_BRIDGE_CLIPS.
// On mount, the page posts DISCERNED_WEB_READY so the extension knows it can send.

import type { ClipData } from '@/lib/types';

export type BridgeMessage =
  | { type: 'DISCERNED_BRIDGE_HELLO'; pubkey: string | null; authMethod: 'nip07' | 'nip46' | 'nsec' | 'guest' | null }
  | { type: 'DISCERNED_BRIDGE_CLIPS'; clips: ClipData[] };

export function listenForBridge(handler: (msg: BridgeMessage) => void): () => void {
  const onMessage = (e: MessageEvent) => {
    if (e.origin !== window.location.origin) return;
    if (e.source !== window) return;
    if (!e.data || typeof e.data !== 'object') return;
    if (typeof e.data.type !== 'string') return;
    if (!e.data.type.startsWith('DISCERNED_BRIDGE_')) return;
    handler(e.data as BridgeMessage);
  };
  window.addEventListener('message', onMessage);
  window.postMessage({ type: 'DISCERNED_WEB_READY' }, window.location.origin);
  return () => window.removeEventListener('message', onMessage);
}
