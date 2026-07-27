import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: any) => void;
          'expired-callback'?: () => void;
          theme?: 'dark' | 'light' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface CloudflareTurnstileProps {
  onVerify: (verified: boolean, token?: string) => void;
  siteKey?: string;
  className?: string;
}

export const CloudflareTurnstile: React.FC<CloudflareTurnstileProps> = ({
  onVerify,
  siteKey = '0x4AAAAAAD_Exkr-g2QpaNgb',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const renderTurnstile = () => {
      if (!containerRef.current || !window.turnstile) return;

      try {
        if (widgetIdRef.current) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch (e) {
            // ignore
          }
        }

        containerRef.current.innerHTML = '';

        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'dark',
          callback: (token: string) => {
            if (isMounted) {
              setStatus('verified');
              onVerify(true, token);
            }
          },
          'error-callback': (errorCode: any) => {
            console.warn('Turnstile error code:', errorCode);
            if (isMounted) {
              setStatus('error');
              setErrorMessage('Cloudflare Turnstile 驗證載入異常');
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              setStatus('ready');
              onVerify(false);
            }
          },
        });

        widgetIdRef.current = id;
        if (isMounted) {
          setStatus('ready');
        }
      } catch (err: any) {
        console.error('Turnstile render error:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err?.message || '請確認網路連線與 Turnstile Site Key 設定');
        }
      }
    };

    const SCRIPT_ID = 'cf-turnstile-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (window.turnstile) {
      renderTurnstile();
    } else if (!script) {
      window.onloadTurnstileCallback = () => {
        if (isMounted) renderTurnstile();
      };

      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('無法連線至 Cloudflare Turnstile 腳本');
        }
      };

      document.head.appendChild(script);
    } else {
      const existingCallback = window.onloadTurnstileCallback;
      window.onloadTurnstileCallback = () => {
        if (existingCallback) existingCallback();
        if (isMounted) renderTurnstile();
      };
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [siteKey]);

  return (
    <div className={`w-full max-w-sm bg-[#141414] border border-[#222] p-2.5 text-white font-mono select-none ${className}`}>
      
      {/* Turnstile Container rendered by Cloudflare API */}
      <div className="flex flex-col items-center justify-center min-h-[65px]">
        <div ref={containerRef} className="flex justify-center w-full" />

        {status === 'loading' && (
          <div className="flex items-center gap-2 py-3 text-xs text-neutral-400">
            <RefreshCw className="w-4 h-4 animate-spin text-[#CBFF00]" />
            <span>載入 Cloudflare Turnstile 機器人防護...</span>
          </div>
        )}
      </div>

      {status === 'error' && (
        <div className="mt-2 text-[11px] text-rose-400 flex items-center justify-between gap-1.5 bg-rose-950/40 p-2 border border-rose-900/80">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[10px] underline text-rose-300 hover:text-white"
          >
            重新整理
          </button>
        </div>
      )}

      {/* Cloudflare Footer Branding */}
      <div className="mt-2 pt-1.5 border-t border-[#222] flex items-center justify-between text-[10px] text-neutral-500 font-mono">
        <div className="flex items-center gap-1 text-[#f48120] font-extrabold tracking-tight">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Cloudflare Turnstile</span>
        </div>
        <span className="text-[9px] text-neutral-600">機器人安全防護驗證</span>
      </div>

    </div>
  );
};
