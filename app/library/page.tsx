'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopBar from '@/components/chrome/TopBar';
import Library from '@/components/clips/Library';
import SignInModal from '@/components/auth/SignInModal';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { useBridgeAuth } from '@/hooks/useBridgeAuth';

function LibraryWithClipId() {
  const searchParams = useSearchParams();
  const initialClipId = searchParams.get('clip') ?? undefined;
  return <Library initialClipId={initialClipId} />;
}

export default function LibraryPage() {
  const router = useRouter();
  const { auth, signInPubkey } = useNostrAuth();
  const { extensionPresent } = useBridgeAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <div>
      <TopBar
        auth={auth}
        onSignIn={() => setSignInOpen(true)}
        onBrandClick={() => router.push('/')}
        searchPlaceholder="Search your clips…"
        extensionPresent={extensionPresent}
      />
      <Suspense fallback={<Library />}>
        <LibraryWithClipId />
      </Suspense>
      {signInOpen && (
        <SignInModal
          onClose={() => setSignInOpen(false)}
          onSignedIn={(pubkey) => signInPubkey(pubkey)}
        />
      )}
    </div>
  );
}
