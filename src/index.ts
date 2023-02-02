import { BikModel, BikCustomerModel } from "./model";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { FirebaseOptions, initializeApp } from "firebase/app";

class BikTracker {
  swFileLocation: string;
  firebaseCompatUrl: string;
  webPushToken: string;
  shopifyCustomerId: string;
  vapidKey: string;
  askedWpPermission: boolean = false;
  bikCustomerId: string;
  source: "woocommerce" | "shopify";
  baseUrl: string;
  firebaseMessaging: Messaging;
  constructor(payload: BikModel) {
    const fcmLocation =
      payload.source === "shopify"
        ? `/apps/bik${payload.r ? "" : "-staging"}/`
        : `/bik/`;
    this.swFileLocation = `${window.location.protocol}//${window.location.host}${fcmLocation}firebase-messaging-sw.js`;

    this.firebaseCompatUrl = `https://cdn.jsdelivr.net/gh/Bik-aiDev/web-push${
      payload.r ? "" : "-staging"
    }/firebase-messaging-compat-1.js`;

    this.baseUrl = payload.baseUrl;
    this.source = payload.source;
    this.initializeMessaging(payload.config, payload.r);
    this.setUpListeners(payload.events);
    this.setUp(payload.vapidKey, payload.r, payload.snowplowCollectorUrl);
  }

  async setUpListeners(events: string[]) {
    global.setUpNotificationClickListener();
    global.setUpFCMListener(
      this.firebaseMessaging,
      events,
      this.swFileLocation
    );
  }

  async initializeMessaging(config: FirebaseOptions, r: boolean) {
    const app = initializeApp(config);
    this.firebaseMessaging = getMessaging(app);
  }

  async generateWebPushToken(vapidKey: string) {
    const isWebPushAllowed = await global.checkWebPushValidity();
    if (!isWebPushAllowed) {
      return;
    }
    const registration = await navigator.serviceWorker.register(
      this.swFileLocation
    );
    try {
      const token = await getToken(this.firebaseMessaging, {
        serviceWorkerRegistration: registration,
        vapidKey: vapidKey,
      });
      if (token) {
        this.webPushToken = token;
      } else {
        console.log(
          "No registration token available. Request permission to generate one."
        );
      }
    } catch (e) {
      console.log("An error occurred while retrieving token. ", e);
      if (!this.askedWpPermission) {
        await this.requestPermission(vapidKey);
      }
    }
  }

  async requestPermission(vapidKey: string) {
    console.log("Requesting permission...");
    this.askedWpPermission = true;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      await this.generateWebPushToken(vapidKey);
    } else {
      console.log("Unable to get permission to notify.");
    }
  }

  async createBikCustomer(): Promise<BikCustomerModel | undefined> {
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

    const response = await fetch(
      `${this.baseUrl}/webPushApiFunctions-registerToken`,
      requestOptions
    );
    const result = await response.json();
    if (result.status === 200) {
      return result.customer;
    } else {
      return undefined;
    }
  }

  setUpShopifyCustomerId() {
    const shopifyCustomerId = global.getShopifyCustomerId();
    if (
      shopifyCustomerId &&
      global.getLocalStorageValue(global.STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER) !==
        "1"
    ) {
      this.shopifyCustomerId = shopifyCustomerId;
    }
  }

  async setUpBikCustomer() {
    if (
      (this.webPushToken || this.shopifyCustomerId) &&
      !global.getLocalStorageValue(global.STORAGE_KEYS.BIK_CUSTOMER_ID)
    ) {
      const bikCustomer = await this.createBikCustomer();
      if (!!bikCustomer) {
        if (bikCustomer.partnerData) {
          global.setLocalStorageValue(
            global.STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER,
            "1"
          );
        }
        this.bikCustomerId = `${bikCustomer.id}`;
        global.setLocalStorageValue(
          global.STORAGE_KEYS.BIK_CUSTOMER_ID,
          `${bikCustomer.id}`
        );
      }
    }
  }

  async setUpWebPushToken(vapidKey: string) {
    if (!global.getLocalStorageValue(global.STORAGE_KEYS.WEB_PUSH_TOKEN)) {
      await this.generateWebPushToken(vapidKey);
      if (this.webPushToken) {
        global.setLocalStorageValue(
          global.STORAGE_KEYS.WEB_PUSH_TOKEN,
          this.webPushToken
        );
      }
    } else {
      this.webPushToken = global.getLocalStorageValue(
        global.STORAGE_KEYS.WEB_PUSH_TOKEN
      );
    }
  }

  async setUp(vapidKey: string, r: boolean, snowplowCollectorUrl: string) {
    await this.setUpWebPushToken(vapidKey);
    this.setUpShopifyCustomerId();
    await this.setUpBikCustomer();
    await global.setUpSnowPlowTracker(
      r,
      snowplowCollectorUrl,
      this.bikCustomerId
    );
  }
}

var BIK =
  BIK ||
  (function () {
    var _args: BikModel = {
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
      init: function (args: BikModel) {
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

