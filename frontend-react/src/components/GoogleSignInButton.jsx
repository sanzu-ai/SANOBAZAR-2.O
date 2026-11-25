import { useEffect, useRef, useState } from 'react';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let googleScriptPromise;
let activeCredentialHandler;
let initializedClientId;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src="${GIS_SCRIPT_URL}"]`);

    const onLoad = () => {
      if (window.google?.accounts?.id) resolve();
      else reject(new Error('Google Identity Services did not initialize.'));
    };
    const onError = () => reject(new Error('Google Identity Services could not be loaded.'));

    if (!script) {
      script = document.createElement('script');
      script.src = GIS_SCRIPT_URL;
      script.async = true;
      script.defer = true;
    }

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });

    if (!script.isConnected) document.head.appendChild(script);
  }).catch(error => {
    googleScriptPromise = undefined;
    throw error;
  });

  return googleScriptPromise;
}

export default function GoogleSignInButton({ onCredential, mode = 'signin' }) {
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(onCredential);
  const [loadError, setLoadError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    credentialHandlerRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;
    const buttonContainer = buttonRef.current;

    if (!clientId) return undefined;

    activeCredentialHandler = credential => credentialHandlerRef.current?.(credential);

    loadGoogleIdentityServices()
      .then(() => {
        if (cancelled || !buttonContainer) return;

        if (initializedClientId !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: response => {
              if (response?.credential) activeCredentialHandler?.(response.credential);
            }
          });
          initializedClientId = clientId;
        }

        buttonContainer.replaceChildren();
        window.google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: mode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: Math.max(200, Math.min(400, Math.floor(buttonContainer.clientWidth)))
        });
      })
      .catch(() => {
        if (!cancelled && buttonContainer) {
          setLoadError('Google sign-in could not load. Check your connection and Google client ID settings.');
        }
      });

    return () => {
      cancelled = true;
      if (activeCredentialHandler) activeCredentialHandler = undefined;
      buttonContainer?.replaceChildren();
    };
  }, [clientId, mode]);

  if (!clientId) {
    return (
      <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">
        Google sign-in is not configured for this frontend.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div ref={buttonRef} className="flex min-h-10 w-full justify-center" aria-label="Continue with Google" />
      {loadError && <p role="alert" className="mt-2 text-center text-xs text-rose-700">{loadError}</p>}
      <p className="mt-2 text-center text-[11px] leading-4 text-[#81756e]">
        Continue with your Google account. Sano Bazar verifies the sign-in securely.
      </p>
      <noscript>
        <p className="mt-2 text-center text-xs text-rose-700">Enable JavaScript to use Google sign-in.</p>
      </noscript>
    </div>
  );
}
