var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define("model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("helper", ["require", "exports", "firebase/messaging"], function (require, exports, messaging_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    global.setUpSnowPlowTracker = (r, snowplowCollectorUrl, bikCustomerId) => {
        const _window = window;
        var sp_clean_obj = function (o) {
            return o && (o.schema ? delete o.schema : o.shift()) && o;
        };
        sp_clean_obj = sp_clean_obj;
        (function (p, l, o, w, i, n, g) {
            if (!p[i]) {
                p.GlobalSnowplowNamespace = p.GlobalSnowplowNamespace || [];
                p.GlobalSnowplowNamespace.push(i);
                p[i] = function () {
                    (p[i].q = p[i].q || []).push(arguments);
                };
                p[i].q = p[i].q || [];
                n = l.createElement(o);
                g = l.getElementsByTagName(o)[0];
                n.async = 1;
                n.src = w;
                g.parentNode.insertBefore(n, g);
            }
        })(window, document, "script", `https://cdn.jsdelivr.net/gh/Bik-aiDev/snowplow-${r ? "" : "staging"}/sp.js`, "snowplow");
        _window.snowplow("bikTracker", "sp1", snowplowCollectorUrl, {
            appId: document.location.hostname,
            platform: "web",
            cookieDomain: document.location.hostname
                .split(".")
                .reverse()
                .splice(0, 2)
                .reverse()
                .join("."),
            post: true,
            contexts: {
                webPage: true,
                performanceTiming: true,
                session: true,
            },
        });
        _window.snowplow("trackPageView");
        _window.snowplow("enableLinkClickTracking", { pseudoClicks: true });
        _window.snowplow("setUserId", bikCustomerId);
        _window.snowplow("refreshLinkClickTracking");
    };
    global.checkWebPushValidity = () => __awaiter(void 0, void 0, void 0, function* () {
        const _navigator = navigator;
        if (_navigator.brave) {
            const isBraveBrowser = yield _navigator.brave.isBrave();
            return !isBraveBrowser;
        }
        else {
            return true;
        }
    });
    global.captureMessageReceiveEvent = (notificationOptions, events) => __awaiter(void 0, void 0, void 0, function* () {
        events.forEach((eventName) => {
            const payload = {
                eventName,
                properties: {
                    openedAt: new Date().toISOString(),
                },
                storeUrl: self.location.host,
                broadcastId: notificationOptions.data.broadcastId,
                customerId: notificationOptions.data.customerId,
            };
            const deliveredRaw = JSON.stringify(payload);
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: deliveredRaw,
            };
            fetch(notificationOptions.data.baseUrl + "/webPushApiFunctions-captureEvent", requestOptions)
                .then((response) => response.text())
                .catch((error) => console.log("error", error));
        });
    });
    global.setUpNotificationClickListener = () => {
        self.addEventListener("notificationclick", function (event) {
            const _event = event;
            console.log("Received notificationclick event");
            if (!event.action) {
                var click_action = _event.notification.data;
                _event.notification.close();
                _event.waitUntil(window.open(click_action));
                return;
            }
            window.open(_event.action);
        });
    };
    global.setUpFCMListener = (messaging, events, swFileLocation) => {
        (0, messaging_1.onMessage)(messaging, (payload) => {
            const actions = JSON.parse(payload.data["actions"]);
            const notificationTitle = payload.data.title;
            const notificationOptions = {
                body: payload.data.body,
                icon: payload.data.icon,
                image: payload.data.image,
                title: payload.data.title,
                data: {
                    url: payload.data.click_action,
                    broadcastId: parseInt(payload.data.broadcast_id),
                    customerId: parseInt(payload.data.customer_id),
                    baseUrl: payload.data.base_url,
                },
                actions,
            };
            global.captureMessageReceiveEvent(notificationOptions, events);
            if (!actions) {
                if (!("Notification" in window)) {
                    console.log("This browser does not support system notifications.");
                }
                else if (Notification.permission === "granted") {
                    // If it's okay let's create a notification
                    var notification = new Notification(notificationTitle, notificationOptions);
                    notification.onclick = function (event) {
                        event.preventDefault();
                        window.open(payload.fcmOptions.link, "_blank");
                        notification.close();
                    };
                }
                return;
            }
            navigator.serviceWorker
                .getRegistration(swFileLocation)
                .then((registration) => {
                registration.showNotification(notificationTitle, notificationOptions);
            });
        });
    };
    global.getShopifyCustomerId = () => {
        return (JSON.parse(Array.from(document.head.getElementsByTagName("script"))
            .find((script) => script.id === "__st")
            .innerHTML.split("var __st=")[1]
            .split(";")[0]).cid || "");
    };
});
define("index", ["require", "exports", "firebase/messaging", "firebase/app"], function (require, exports, messaging_2, app_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BikTracker {
        constructor(payload) {
            this.askedWpPermission = false;
            const fcmLocation = payload.source === "shopify"
                ? `/apps/bik${payload.r ? "" : "-staging"}/`
                : `/bik/`;
            this.swFileLocation = `${window.location.protocol}//${window.location.host}${fcmLocation}firebase-messaging-sw.js`;
            this.firebaseCompatUrl = `https://cdn.jsdelivr.net/gh/Bik-aiDev/web-push${payload.r ? "" : "-staging"}/firebase-messaging-compat-1.js`;
            this.baseUrl = payload.baseUrl;
            this.source = payload.source;
            this.initializeMessaging(payload.config, payload.r);
            this.setUpListeners(payload.events);
            this.setUp(payload.vapidKey, payload.r, payload.snowplowCollectorUrl);
        }
        setUpListeners(events) {
            return __awaiter(this, void 0, void 0, function* () {
                global.setUpNotificationClickListener();
                global.setUpFCMListener(this.firebaseMessaging, events, this.swFileLocation);
            });
        }
        initializeMessaging(config, r) {
            return __awaiter(this, void 0, void 0, function* () {
                const app = (0, app_1.initializeApp)(config);
                this.firebaseMessaging = (0, messaging_2.getMessaging)(app);
            });
        }
        generateWebPushToken(vapidKey) {
            return __awaiter(this, void 0, void 0, function* () {
                const isWebPushAllowed = yield global.checkWebPushValidity();
                if (!isWebPushAllowed) {
                    return;
                }
                const registration = yield navigator.serviceWorker.register(this.swFileLocation);
                try {
                    const token = yield (0, messaging_2.getToken)(this.firebaseMessaging, {
                        serviceWorkerRegistration: registration,
                        vapidKey: vapidKey,
                    });
                    if (token) {
                        this.webPushToken = token;
                    }
                    else {
                        console.log("No registration token available. Request permission to generate one.");
                    }
                }
                catch (e) {
                    console.log("An error occurred while retrieving token. ", e);
                    if (!this.askedWpPermission) {
                        yield this.requestPermission(vapidKey);
                    }
                }
            });
        }
        requestPermission(vapidKey) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Requesting permission...");
                this.askedWpPermission = true;
                const permission = yield Notification.requestPermission();
                if (permission === "granted") {
                    console.log("Notification permission granted.");
                    yield this.generateWebPushToken(vapidKey);
                }
                else {
                    console.log("Unable to get permission to notify.");
                }
            });
        }
        createBikCustomer() {
            return __awaiter(this, void 0, void 0, function* () {
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                var raw = JSON.stringify({
                    token: this.webPushToken,
                    storeUrl: window.location.host,
                    source: this.source,
                });
                var requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                };
                const response = yield fetch(`${this.baseUrl}/webPushApiFunctions-registerToken`, requestOptions);
                const result = yield response.json();
                if (result.status === 200) {
                    return result.customer;
                }
                else {
                    return undefined;
                }
            });
        }
        setUpShopifyCustomerId() {
            const shopifyCustomerId = global.getShopifyCustomerId();
            if (shopifyCustomerId &&
                global.getLocalStorageValue(global.STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER) !==
                    "1") {
                this.shopifyCustomerId = shopifyCustomerId;
            }
        }
        setUpBikCustomer() {
            return __awaiter(this, void 0, void 0, function* () {
                if ((this.webPushToken || this.shopifyCustomerId) &&
                    !global.getLocalStorageValue(global.STORAGE_KEYS.BIK_CUSTOMER_ID)) {
                    const bikCustomer = yield this.createBikCustomer();
                    if (!!bikCustomer) {
                        if (bikCustomer.partnerData) {
                            global.setLocalStorageValue(global.STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER, "1");
                        }
                        this.bikCustomerId = `${bikCustomer.id}`;
                        global.setLocalStorageValue(global.STORAGE_KEYS.BIK_CUSTOMER_ID, `${bikCustomer.id}`);
                    }
                }
            });
        }
        setUpWebPushToken(vapidKey) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!global.getLocalStorageValue(global.STORAGE_KEYS.WEB_PUSH_TOKEN)) {
                    yield this.generateWebPushToken(vapidKey);
                    if (this.webPushToken) {
                        global.setLocalStorageValue(global.STORAGE_KEYS.WEB_PUSH_TOKEN, this.webPushToken);
                    }
                }
                else {
                    this.webPushToken = global.getLocalStorageValue(global.STORAGE_KEYS.WEB_PUSH_TOKEN);
                }
            });
        }
        setUp(vapidKey, r, snowplowCollectorUrl) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.setUpWebPushToken(vapidKey);
                this.setUpShopifyCustomerId();
                yield this.setUpBikCustomer();
                yield global.setUpSnowPlowTracker(r, snowplowCollectorUrl, this.bikCustomerId);
            });
        }
    }
    var BIK = BIK ||
        (function () {
            var _args = {
                r: false,
                baseUrl: "",
                vapidKey: "",
                config: {
                    apiKey: "",
                    appId: "",
                    authDomain: "",
                    databaseURL: "",
                    messagingSenderId: "",
                    projectId: "",
                    storageBucket: "",
                },
                events: [],
                source: "shopify",
                snowplowCollectorUrl: "",
            };
            return {
                init: function (args) {
                    debugger;
                    _args = args;
                    const bikTracker = new BikTracker(args);
                    console.log(bikTracker.baseUrl);
                },
                fetch: function () {
                    return _args;
                },
            };
        })();
    global.BIK = BIK;
    function setUpNotificationClickListener() {
        throw new Error("Function not implemented.");
    }
});
global.STORAGE_KEYS = {
    BIK_CUSTOMER_ID: "BIK_CUSTOMER_ID",
    SENT_CUSTOMER_ID_TO_SERVER: "SENT_CUSTOMER_ID_TO_SERVER",
    WEB_PUSH_TOKEN: "WEB_PUSH_TOKEN",
};
global.STORAGE_LOCATION = {
    LOCAL_STORAGE: "LOCAL_STORAGE",
    COOKIE: "COOKIE",
};
global.StorageKeysMap = {
    [global.STORAGE_KEYS.BIK_CUSTOMER_ID]: {
        value: "bik_customer_id",
        location: global.STORAGE_LOCATION.LOCAL_STORAGE,
    },
    [global.STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER]: {
        value: "sent_customer_id_to_server",
        location: global.STORAGE_LOCATION.LOCAL_STORAGE,
    },
    [global.STORAGE_KEYS.WEB_PUSH_TOKEN]: {
        value: "web_push_token",
        location: global.STORAGE_LOCATION.COOKIE,
    },
};
global.getLocalStorageValue = (key) => {
    if (global.StorageKeysMap[key].location === global.STORAGE_LOCATION.COOKIE) {
        return global.getCookie(global.StorageKeysMap[key].value);
    }
    return window.localStorage.getItem(global.StorageKeysMap[key].value);
};
global.setLocalStorageValue = (key, value) => {
    if (global.StorageKeysMap[key].location === global.TORAGE_LOCATION.COOKIE) {
        global.createCookie(global.StorageKeysMap[key].value, value);
        return;
    }
    window.localStorage.setItem(global.StorageKeysMap[key].value, value);
};
global.deleteLocalStorageValue = (key) => {
    if (global.StorageKeysMap[key].location === global.STORAGE_LOCATION.COOKIE) {
        global.clearCookie(global.StorageKeysMap[key].value);
        return;
    }
    window.localStorage.removeItem(global.StorageKeysMap[key].value);
};
global.createCookie = (name, value, days = 3650) => {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = "; expires=" + date.toISOString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
};
global.getCookie = (cookieName) => {
    if (document.cookie.length > 0) {
        let cookieStart = document.cookie.indexOf(cookieName + "=");
        if (cookieStart != -1) {
            cookieStart = cookieStart + cookieName.length + 1;
            let cookieEn = document.cookie.indexOf(";", cookieStart);
            if (cookieEn == -1) {
                cookieEn = document.cookie.length;
            }
            return document.cookie.substring(cookieStart, cookieEn);
        }
    }
    return "";
};
global.clearCookie = (cookieName) => {
    global.createCookie(cookieName, "");
};
//# sourceMappingURL=index.js.map