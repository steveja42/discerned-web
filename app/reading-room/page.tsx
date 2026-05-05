// /reading-room page — displays the user's private clips delivered from the extension.
// Renders TopBar and ReadingRoom; clips arrive via the postMessage bridge, not Nostr.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopBar from '@/components/chrome/TopBar';
import ReadingRoom from '@/components/clips/ReadingRoom';
import SignInModal from '@/components/auth/SignInModal';
import { useNostrAuth } from '@/hooks/useNostrAuth';

export default function ReadingRoomPage() {
  const { auth, signInPubkey } = useNostrAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <div>
      <TopBar
        auth={auth}
        onSignIn={() => setSignInOpen(true)}
        searchPlaceholder="Search your clips…"
      />
      <div className="subpage-bar">
        <Link href="/" className="back-link">← Back to Cast</Link>
        <span className="subpage-title">Your Reading Room</span>
        <span className="subpage-meta">Opened from extension · IndexedDB</span>
      </div>
      <ReadingRoom />
      {signInOpen && (
        <SignInModal
          onClose={() => setSignInOpen(false)}
          onSignedIn={(pubkey) => signInPubkey(pubkey)}
        />
      )}
    </div>
  );
}
