import { BikModel, BikCustomerModel, SnowplowModel } from "./model";
import { getMessaging, getToken, Messaging } from "firebase/messaging";
import { initializeApp } from "firebase/app";
import {
  getLocalStorageValue,
  setLocalStorageValue,
  STORAGE_KEYS,
} from "./utils";
import {
  setUpNotificationClickListener,
  setUpFCMListener,
  checkWebPushValidity,
  getShopifyCustomerId,
  setUpSnowPlowTracker,
} from "./helper";
import { config } from "./config";

export class BikTracker {
  swFileLocation: string;
  webPushToken: string;
  shopifyCustomerId: string;
  vapidKey: string;
  askedWpPermission: boolean = false;
  bikCustomerId: string;
  source: "woocommerce" | "shopify";
  baseUrl: string;
  firebaseMessaging: Messaging;
  constructor(payload: BikModel) {
    this.init(payload);
  }

  async init(payload: BikModel) {
    this.swFileLocation = `${window.location.protocol}//${
      window.location.host
    }${
      config[`${payload.r}`].fcmLocation[payload.source]
    }firebase-messaging-sw.js`;

    this.baseUrl = payload.baseUrl;
    this.source = payload.source;
    this.initializeMessaging(payload.r);
    this.setUpListeners(payload.events);
    this.setUp(
      config[`${payload.r}`].vapidKey,
      config[`${payload.r}`].snowplow
    );
  }

  async setUpListeners(events: string[]) {
    setUpNotificationClickListener();
    setUpFCMListener(this.firebaseMessaging, events, this.swFileLocation);
  }

  async initializeMessaging(r: boolean) {
    const app = initializeApp(config[`${r}`].firebase);
    this.firebaseMessaging = getMessaging(app);
  }

  async generateWebPushToken(vapidKey: string) {
    const isWebPushAllowed = await checkWebPushValidity();
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
    const shopifyCustomerId = getShopifyCustomerId();
    if (
      shopifyCustomerId &&
      getLocalStorageValue(STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER) !== "1"
    ) {
      this.shopifyCustomerId = shopifyCustomerId;
    }
  }

  async setUpBikCustomer() {
    if (
      (this.webPushToken || this.shopifyCustomerId) &&
      !getLocalStorageValue(STORAGE_KEYS.BIK_CUSTOMER_ID)
    ) {
      const bikCustomer = await this.createBikCustomer();
      if (!!bikCustomer) {
        if (bikCustomer.partnerData) {
          setLocalStorageValue(STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER, "1");
        }
        this.bikCustomerId = `${bikCustomer.id}`;
        setLocalStorageValue(STORAGE_KEYS.BIK_CUSTOMER_ID, `${bikCustomer.id}`);
      }
    }
  }

  async setUpWebPushToken(vapidKey: string) {
    if (!getLocalStorageValue(STORAGE_KEYS.WEB_PUSH_TOKEN)) {
      await this.generateWebPushToken(vapidKey);
      if (this.webPushToken) {
        setLocalStorageValue(STORAGE_KEYS.WEB_PUSH_TOKEN, this.webPushToken);
      }
    } else {
      this.webPushToken = getLocalStorageValue(STORAGE_KEYS.WEB_PUSH_TOKEN);
    }
  }

  async setUp(vapidKey: string, snowplowConfig: SnowplowModel) {
    await this.setUpWebPushToken(vapidKey);
    this.setUpShopifyCustomerId();
    await this.setUpBikCustomer();
    await setUpSnowPlowTracker(snowplowConfig, this.bikCustomerId);
  }
}

global.BIK = function (bikModel: BikModel) {
  new BikTracker(bikModel);
};
