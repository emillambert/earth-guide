"use client";

import { useEffect } from "react";

const SW_VERSION_KEY = "earth-guide-sw-version";
const SW_VERSION = "v5-branded-assets";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const previous = window.localStorage.getItem(SW_VERSION_KEY);
    const bootstrap = async () => {
      // One-time cleanup after earlier broken SW builds.
      if (previous !== SW_VERSION) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }
        window.localStorage.setItem(SW_VERSION_KEY, SW_VERSION);
      }

      await navigator.serviceWorker.register("/sw.js");
    };

    void bootstrap().catch(() => {
      // Offline shell is best-effort.
    });
  }, []);

  return null;
}
