import { BikModel, BikCustomerModel, StoreSourceType } from "./model";
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
} from "./helper";
import { config } from "./config";

export class BikTracker {
  swFileLocation: string;
  webPushToken: string;
  shopifyCustomerId: string;
  vapidKey: string;
  askedWpPermission: boolean = false;
  bikCustomerId: string;
  source: StoreSourceType;
  baseUrl: string;
  firebaseMessaging: Messaging;
  isProd: boolean;
  constructor(payload: BikModel) {
    this.isProd = payload.r;

    this.swFileLocation = `${window.location.protocol}//${
      window.location.host
    }${config[`${this.isProd}`].fcmLocation[payload.source]}bik-webpush.js`;

    this.baseUrl = payload.baseUrl;
    this.source = payload.source;
    if (payload.isWpOpted) {
      this.initializeMessaging();
      this.setUpListeners(payload.events);
    }
  }

  async init(isWpOpted: boolean) {
    if (isWpOpted) {
      await this.setUpWebPushToken(config[`${this.isProd}`].vapidKey);
    }
    this.setUpShopifyCustomerId();
  }

  async setUpListeners(events: string[]) {
    setUpNotificationClickListener();
    setUpFCMListener(this.firebaseMessaging, events, this.swFileLocation);
  }

  async initializeMessaging() {
    delete config[`${!this.isProd}`];
    const app = initializeApp(config[`${this.isProd}`].firebase);
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
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      webPushToken: this.webPushToken,
      partnerCustomerId: this.shopifyCustomerId,
      storeUrl: window.location.host,
      source: this.source,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
    };

    const response = await fetch(
      `${this.baseUrl}/bikTrackerApiFunctions-createBikCustomer`,
      requestOptions
    );
    const result = await response.json();
    if (result.status) {
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

  async createOrUpdateBikCustomer(isWpOpted: boolean): Promise<string> {
    await this.init(isWpOpted);

    if (
      (this.webPushToken || this.shopifyCustomerId) &&
      !getLocalStorageValue(STORAGE_KEYS.BIK_CUSTOMER_ID)
    ) {
      const bikCustomer = await this.createBikCustomer();
      if (!!bikCustomer) {
        if (bikCustomer.partnerCustomerId) {
          setLocalStorageValue(STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER, "1");
        }
        this.bikCustomerId = `${bikCustomer.id}`;
        setLocalStorageValue(STORAGE_KEYS.BIK_CUSTOMER_ID, `${bikCustomer.id}`);
      }
    }
    return getLocalStorageValue(STORAGE_KEYS.BIK_CUSTOMER_ID);
  }

  async getUserId(r: boolean, isWpOpted: boolean) {
    this.isProd = r;
    let bikCustomerId = getLocalStorageValue(STORAGE_KEYS.BIK_CUSTOMER_ID);
    if (bikCustomerId) {
      this.createOrUpdateBikCustomer(isWpOpted);
    } else {
      bikCustomerId = await this.createOrUpdateBikCustomer(isWpOpted);
    }
    return bikCustomerId;
  }
}

global.BIK = {
  getUserId: async (bikModel: BikModel) => {
    const bikTracker = new BikTracker(bikModel);
    const userId = await bikTracker.getUserId(bikModel.r, bikModel.isWpOpted);
    return userId;
  },
};
