// /library page — displays the user's private clips delivered from the extension.
// Renders TopBar and Library; clips arrive via the postMessage bridge, not Nostr.

'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopBar from '@/components/chrome/TopBar';
import Library from '@/components/clips/Library';
import SignInModal from '@/components/auth/SignInModal';
import { useNostrAuth } from '@/hooks/useNostrAuth';

export default function LibraryPage() {
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
        <Link href="/" className="back-link">← Back to Discernments</Link>
        <span className="subpage-title">My Library</span>
        <span className="subpage-meta">Opened from extension · IndexedDB</span>
      </div>
      <Library />
      {signInOpen && (
        <SignInModal
          onClose={() => setSignInOpen(false)}
          onSignedIn={(pubkey) => signInPubkey(pubkey)}
        />
      )}
    </div>
  );
}
