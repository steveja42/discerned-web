'use client';

import { useState, useEffect } from 'react';
import { listenForBridge } from '@/lib/bridge/extension-bridge';
import { useNostrAuth } from '@/hooks/useNostrAuth';

export function useBridgeAuth() {
  const { setBridgeAuth } = useNostrAuth();
  const [extensionPresent, setExtensionPresent] = useState(false);

  useEffect(() => {
    return listenForBridge((msg) => {
      if (msg.type === 'DISCERNED_BRIDGE_HELLO') {
        setExtensionPresent(true);
        if (msg.pubkey) setBridgeAuth(msg.pubkey);
      }
    });
  }, [setBridgeAuth]);

  return { extensionPresent };
}
