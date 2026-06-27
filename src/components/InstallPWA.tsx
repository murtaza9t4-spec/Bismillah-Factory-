import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const onClick = (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();
    if (!promptInstall) {
      return;
    }
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
    });
  };

  if (!supportsPWA) {
    return null;
  }

  return (
    <button
      className="flex items-center gap-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors ml-2 sm:ml-4 mr-1 sm:mr-2 cursor-pointer"
      dir="ltr"
      onClick={onClick}
    >
      <Download size={14} className="sm:w-4 sm:h-4" />
      <span>Install App</span>
    </button>
  );
}
