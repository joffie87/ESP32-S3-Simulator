/*! coi-serviceworker v0.1.7 - Guido Zuidhof and contributors, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

    self.addEventListener("message", (ev) => {
        if (!ev.data) {
            return;
        } else if (ev.data.type === "deregister") {
            self.registration
                .unregister()
                .then(() => {
                    return self.clients.matchAll();
                })
                .then(clients => {
                    clients.forEach((client) => client.navigate(client.url));
                });
        } else if (ev.data.type === "coepCredentialless") {
            coepCredentialless = ev.data.value;
        }
    });

    self.addEventListener("fetch", function (event) {
        const r = event.request;
        if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
            return;
        }

        const request = (coepCredentialless && r.mode === "no-cors")
            ? new Request(r, {
                credentials: "omit",
            })
            : r;
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.status === 0) {
                        return response;
                    }

                    const newHeaders = new Headers(response.headers);
                    newHeaders.set("Cross-Origin-Embedder-Policy",
                        coepCredentialless ? "credentialless" : "require-corp"
                    );
                    if (!coepCredentialless) {
                        newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");
                    }
                    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: newHeaders,
                    });
                })
                .catch((e) => console.error(e))
        );
    });

} else {
    (() => {
        const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
        window.sessionStorage.removeItem("coiReloadedBySelf");
        const coepDegrading = (reloadedBySelf == "coepdegrade");

        const coepCredentialless = !coepDegrading && (window.crossOriginIsolated !== false);

        if (!coepCredentialless) {
            console.log("COOP/COEP Service Worker: attempting to obtain cross origin isolation.");
        }

        if (window.crossOriginIsolated !== false && !coepDegrading) {
            return;
        }

        if (
            navigator.serviceWorker &&
            location.hostname !== "localhost" &&
            !location.hostname.match(/127\.0\.0\.[0-9]+/)
        ) {
            const reloadToSamePage = () => {
                window.sessionStorage.setItem("coiReloadedBySelf", "coepdegrade");
                location.reload();
            };

            navigator.serviceWorker
                .getRegistration()
                .then((registration) => {
                    if (registration?.active?.state === "activated") {
                        if (!window.crossOriginIsolated) {
                            if (coepDegrading) {
                                console.log("COOP/COEP Service Worker: cross-origin isolation lost after reload");
                            } else {
                                registration.active.postMessage({ type: "coepCredentialless", value: coepCredentialless });
                                if (coepCredentialless) {
                                    console.log("COOP/COEP Service Worker: credentialless coep selected");
                                } else {
                                    console.log("COOP/COEP Service Worker: will reload page to apply cross origin isolation.");
                                    reloadToSamePage();
                                }
                            }
                        }
                    } else {
                        return navigator.serviceWorker
                            .register(window.document.currentScript.src)
                            .then((registration) => {
                                registration.addEventListener("updatefound", () => {
                                    console.log("COOP/COEP Service Worker: update found, will reload page when ready.");
                                    registration.installing.addEventListener("statechange", () => {
                                        if (registration.waiting) {
                                            if (!window.crossOriginIsolated) {
                                                registration.waiting.postMessage({ type: "coepCredentialless", value: coepCredentialless });
                                                reloadToSamePage();
                                            }
                                        }
                                    });
                                });
                            });
                    }
                });
        }
    })();
}
