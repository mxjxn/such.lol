'use client';

import { FC, ReactNode, useEffect, useState } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import '@neynar/react/dist/style.css';

interface FarcasterContext {
  user: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
  } | null;
  isReady: boolean;
}

export const FarcasterContext = React.createContext<FarcasterContext>({
  user: null,
  isReady: false,
});

import React from 'react';

interface ProvidersProps {
  children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
  const [user, setUser] = useState<FarcasterContext['user']>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        // Initialize Farcaster SDK
        await sdk.actions.ready();

        // Get user context from SDK (await since context is now a Promise)
        const context = await sdk.context;
        if (context?.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username || '',
            displayName: context.user.displayName || '',
            pfpUrl: context.user.pfpUrl || '',
          });
        }

        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
        setIsReady(true);
      }
    };

    initFarcaster();
  }, []);

  return (
    <FarcasterContext.Provider value={{ user, isReady }}>
      {children}
    </FarcasterContext.Provider>
  );
};

export default Providers;
