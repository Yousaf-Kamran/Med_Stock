// This is a placeholder service worker file.
// The actual logic is handled by the useMedicineNotifications hook.
// This file is required by browsers to register a service worker.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
