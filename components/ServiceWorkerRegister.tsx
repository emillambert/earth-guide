"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { loadState } from "@/lib/storage";

export function ServiceWorkerRegister() {
  const pathname = usePathname();
  const warmedWorkers = useRef(new WeakSet<ServiceWorker>());

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const bootstrap = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js");
      await registration.update();
    };

    void bootstrap().catch(() => {
      // Offline shell is best-effort.
    });
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const prewarm = async () => {
      const registration = await navigator.serviceWorker.ready;
      const worker = registration.active;
      if (!worker) return;

      const resourceUrls = performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((value) => {
          try {
            const url = new URL(value);
            return (
              url.origin === window.location.origin &&
              (url.pathname.startsWith("/_next/static/") ||
                url.pathname.startsWith("/icons/"))
            );
          } catch {
            return false;
          }
        });

      worker.postMessage({
        type: "CACHE_RESOURCES",
        urls: Array.from(new Set(resourceUrls)),
      });

      if (!warmedWorkers.current.has(worker)) {
        warmedWorkers.current.add(worker);
        for (const entry of loadState().savedEntries) {
          worker.postMessage({
            type: "CACHE_ENTRY_ROUTE",
            path: `/entry/${encodeURIComponent(entry.id)}`,
          });
        }
      }
    };

    const timer = window.setTimeout(() => {
      void prewarm().catch(() => {
        // Offline support remains best-effort.
      });
    }, 250);
    const handleControllerChange = () => {
      void prewarm().catch(() => {
        // A later route change will retry.
      });
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );
    return () => {
      window.clearTimeout(timer);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, [pathname]);

  return null;
}
