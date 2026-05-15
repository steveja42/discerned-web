'use client';

import { useState, useEffect } from 'react';
import type { BridgeMessage } from '@/lib/bridge/extension-bridge';
import { useNostrAuth } from '@/hooks/useNostrAuth';

export function useBridgeAuth() {
  const { setBridgeAuth } = useNostrAuth();
  const [extensionPresent, setExtensionPresent] = useState(false);

  useEffect(() => {
    // Listen passively — do NOT post DISCERNED_WEB_READY here. That signal is
    // sent only by useLibraryBridge so the extension knows the clip count and
    // can skip redundant sends. useBridgeAuth only needs HELLO for auth state.
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.source !== window) return;
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type !== 'DISCERNED_BRIDGE_HELLO') return;
      const msg = e.data as BridgeMessage;
      if (msg.type === 'DISCERNED_BRIDGE_HELLO') {
        setExtensionPresent(true);
        if (msg.pubkey) setBridgeAuth(msg.pubkey);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setBridgeAuth]);

  return { extensionPresent };
}
