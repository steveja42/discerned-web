'use client';

import { useState, useEffect } from 'react';
import type { ClipData } from '@/lib/types';
import { listenForBridge } from '@/lib/bridge/extension-bridge';

interface BridgeState {
  bridgePresent: boolean;
  pubkey: string | null;
  authMethod: string | null;
  clips: ClipData[];
  timedOut: boolean;
}

export function useReadingRoomBridge() {
  const [state, setState] = useState<BridgeState>({
    bridgePresent: false,
    pubkey: null,
    authMethod: null,
    clips: [],
    timedOut: false,
  });

  useEffect(() => {
    const cleanup = listenForBridge((msg) => {
      if (msg.type === 'DISCERNED_BRIDGE_HELLO') {
        setState((s) => ({ ...s, bridgePresent: true, pubkey: msg.pubkey, authMethod: msg.authMethod }));
      }
      if (msg.type === 'DISCERNED_BRIDGE_CLIPS') {
        setState((s) => ({ ...s, clips: msg.clips }));
      }
    });

    const timer = setTimeout(() => {
      setState((s) => s.bridgePresent ? s : { ...s, timedOut: true });
    }, 2000);

    return () => {
      cleanup();
      clearTimeout(timer);
    };
  }, []);

  return state;
}
