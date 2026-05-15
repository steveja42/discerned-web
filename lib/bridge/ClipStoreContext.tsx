'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { ClipData } from '@/lib/types';
import { sendDeleteClips, sendUpdateNote } from '@/lib/bridge/extension-bridge';

interface ClipStoreState {
  clips: ClipData[];
  bridgePresent: boolean;
  pubkey: string | null;
  authMethod: string | null;
  timedOut: boolean;
}

interface ClipStoreActions {
  setClips: (clips: ClipData[]) => void;
  prependClip: (clip: ClipData) => void;
  removeClips: (ids: string[]) => void;
  updateClipNote: (id: string, note: string) => void;
  setBridgePresent: (pubkey: string | null, authMethod: string | null) => void;
  setTimedOut: () => void;
}

const ClipStoreContext = createContext<(ClipStoreState & ClipStoreActions) | null>(null);

export function ClipStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ClipStoreState>({
    clips: [],
    bridgePresent: false,
    pubkey: null,
    authMethod: null,
    timedOut: false,
  });

  const setClips = useCallback((clips: ClipData[]) => {
    setState((s) => ({ ...s, clips }));
  }, []);

  const prependClip = useCallback((clip: ClipData) => {
    setState((s) => {
      if (s.clips.some((c) => c.capture.id === clip.capture.id)) return s;
      return { ...s, clips: [clip, ...s.clips] };
    });
  }, []);

  const removeClips = useCallback((ids: string[]) => {
    setState((s) => ({ ...s, clips: s.clips.filter((c) => !ids.includes(c.capture.id)) }));
    sendDeleteClips(ids);
  }, []);

  const updateClipNote = useCallback((id: string, note: string) => {
    setState((s) => ({
      ...s,
      clips: s.clips.map((c) =>
        c.capture.id === id
          ? { ...c, capture: { ...c.capture, note: note || undefined } }
          : c,
      ),
    }));
    sendUpdateNote(id, note);
  }, []);

  const setBridgePresent = useCallback((pubkey: string | null, authMethod: string | null) => {
    setState((s) => ({ ...s, bridgePresent: true, pubkey, authMethod }));
  }, []);

  const setTimedOut = useCallback(() => {
    setState((s) => (s.bridgePresent ? s : { ...s, timedOut: true }));
  }, []);

  return (
    <ClipStoreContext.Provider
      value={{ ...state, setClips, prependClip, removeClips, updateClipNote, setBridgePresent, setTimedOut }}
    >
      {children}
    </ClipStoreContext.Provider>
  );
}

export function useClipStore(): ClipStoreState & ClipStoreActions {
  const ctx = useContext(ClipStoreContext);
  if (!ctx) throw new Error('useClipStore must be used within ClipStoreProvider');
  return ctx;
}
