'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/chrome/TopBar';
import CastFeed from '@/components/feed/CastFeed';
import SignInModal from '@/components/auth/SignInModal';
import FirstVisitPopover from '@/components/popover/FirstVisitPopover';
import { useNostrAuth } from '@/hooks/useNostrAuth';
import { useFirstVisit } from '@/hooks/useFirstVisit';
import { useCastFeed } from '@/hooks/useCastFeed';

export default function HomeClient() {
  const router = useRouter();
  const { auth, signInNip07, signInPubkey } = useNostrAuth();
  const { showPopover, dismiss: dismissPopover } = useFirstVisit();
  const { clips, status } = useCastFeed();
  const [signInOpen, setSignInOpen] = useState(false);

  const handleBrandClick = () => {
    dismissPopover();
    router.push('/about');
  };

  const handleLearnMore = () => {
    dismissPopover();
    router.push('/about');
  };

  return (
    <div style={{ position: 'relative' }}>
      <TopBar
        auth={auth}
        onSignIn={() => setSignInOpen(true)}
        brandHasPopover={showPopover}
        onBrandClick={handleBrandClick}
      />

      {showPopover && (
        <FirstVisitPopover
          onDismiss={dismissPopover}
          onLearnMore={handleLearnMore}
        />
      )}

      <CastFeed clips={clips} status={status} />

      {signInOpen && (
        <SignInModal
          onClose={() => setSignInOpen(false)}
          onSignedIn={(pubkey) => signInPubkey(pubkey)}
        />
      )}
    </div>
  );
}
