'use client';

import { useEffect } from 'react';
import { listenForBridge } from '@/lib/bridge/extension-bridge';
import { useNostrAuth } from '@/hooks/useNostrAuth';

export function useBridgeAuth() {
  const { setBridgeAuth } = useNostrAuth();

  useEffect(() => {
    return listenForBridge((msg) => {
      if (msg.type === 'DISCERNED_BRIDGE_HELLO' && msg.pubkey) {
        setBridgeAuth(msg.pubkey);
      }
    });
  }, [setBridgeAuth]);
}
