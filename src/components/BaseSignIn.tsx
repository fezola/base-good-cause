// Optional Base Sign-In Component
import { useState, useEffect } from 'react';
import { createBaseAccountSDK } from '@base-org/account';

interface BaseSignInProps {
  onSignIn?: (isSignedIn: boolean) => void;
  className?: string;
}

export function BaseSignIn({ onSignIn, className }: BaseSignInProps) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [SignInWithBaseButton, setSignInWithBaseButton] = useState<any>(null);

  // Try to load SignInWithBaseButton
  useEffect(() => {
    const loadSignInButton = async () => {
      try {
        const module = await import('@base-org/account-ui/react');
        if (module.SignInWithBaseButton) {
          setSignInWithBaseButton(() => module.SignInWithBaseButton);
          console.log('✅ SignInWithBaseButton loaded');
        }
      } catch (error) {
        console.log('❌ SignInWithBaseButton not available');
      }
    };

    loadSignInButton();
  }, []);

  // Create Base Account SDK
  const sdk = createBaseAccountSDK({
    appName: 'FundMe',
    appLogo: 'https://base.org/favicon.ico' // You can replace with your logo
  });

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await sdk.getProvider().request({ method: 'wallet_connect' });
      setIsSignedIn(true);
      onSignIn?.(true);
      console.log('✅ Successfully signed in with Base');
    } catch (err) {
      console.error('❌ Sign-in error:', err);
      onSignIn?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignedIn) {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center space-x-2 text-green-600 text-sm">
          <span>✅</span>
          <span>Connected to Base</span>
        </div>
      </div>
    );
  }

  // Don't render anything if SignInWithBaseButton is not available
  if (!SignInWithBaseButton) {
    return null;
  }

  return (
    <div className={`text-center ${className}`}>
      {/* Optional: Custom sign-in button */}
      <div className="space-y-3">
        <SignInWithBaseButton
          onConnect={handleSignIn}
          disabled={isLoading}
        />

        {isLoading && (
          <div className="text-sm text-gray-500">
            Connecting to Base...
          </div>
        )}

        <div className="text-xs text-gray-400">
          Sign in to identify yourself (optional)
        </div>
      </div>
    </div>
  );
}
