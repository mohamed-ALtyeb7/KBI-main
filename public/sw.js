const CACHE_NAME = "kbi-repair-v1"
const SCOPE_PATH = new URL(self.registration.scope).pathname
const BASE = SCOPE_PATH.endsWith("/") ? SCOPE_PATH.slice(0, -1) : SCOPE_PATH
const OFFLINE_URL = `${BASE}/offline.html`

const STATIC_ASSETS = [
  `${BASE}/`,
  `${BASE}/book`,
  `${BASE}/track`,
  `${BASE}/offline.html`,
  `${BASE}/manifest.json`
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return

  // Skip API requests and Firebase
  const url = new URL(event.request.url)
  if (url.pathname.startsWith(`${BASE}/api/`) ||
    url.pathname.startsWith(`${BASE}/_next/`) ||
    url.searchParams.has("_rsc") ||
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response and update cache in background
        event.waitUntil(
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response)
              })
            }
          }).catch(() => { })
        )
        return cachedResponse
      }

      // Not in cache, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.ok && response.type === "basic") {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return response
        })
        .catch(() => {
          // Network failed, return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL)
          }
          return new Response("Offline", { status: 503, statusText: "Offline" })
        })
    })
  )
})

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {}

  const options = {
    body: data.body || "You have a new notification",
    icon: `${BASE}/apple-icon.png`,
    badge: `${BASE}/icon-light-32x32.png`,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || `${BASE}/`
    },
    actions: [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || "KBI Repair", options)
  )
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "view" || !event.action) {
    const url = event.notification.data?.url || `${BASE}/`
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((clientList) => {
        // Focus existing window or open new one
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus()
          }
        }
        return clients.openWindow(url)
      })
    )
  }
})
