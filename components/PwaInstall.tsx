"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stand =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator &&
        Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    setStandalone(stand);

    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);
    setIos(isIos);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (standalone || hidden) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setHidden(true);
  }

  if (!deferred && !ios) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] mx-auto max-w-lg bg-ink text-paper rounded-2xl px-4 py-3 shadow-lg flex items-start gap-3">
      <div className="flex-1 text-sm">
        {ios ? (
          <>
            <p className="font-medium mb-1">Install Hopayola</p>
            <p className="text-paper/70 text-xs leading-relaxed">
              iPhone: tap Share, then Add to Home Screen. Chrome on Android
              shows Install below.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium mb-1">Install Hopayola</p>
            <p className="text-paper/70 text-xs">
              Add the app to your home screen. Same site, works offline-ready.
            </p>
          </>
        )}
      </div>
      {!ios && deferred && (
        <button
          type="button"
          onClick={install}
          className="shrink-0 bg-royal text-paper text-sm rounded-full px-4 py-2"
        >
          Install
        </button>
      )}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => setHidden(true)}
        className="text-paper/50 hover:text-paper text-xl leading-none"
      >
        &times;
      </button>
    </div>
  );
}
