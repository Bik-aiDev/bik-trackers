export type StoreSourceType = "woocommerce" | "shopify";

export interface FirebaseOptions {
  apiKey: string;
  appId: string;
  authDomain: string;
  databaseURL: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
  serviceAccountId: string;
}

export interface BikModel {
  r: boolean;
  baseUrl: string;
  events: string[];
  source: StoreSourceType;
}

export interface BikTrackerModel {
  baseUrl: string;
  vapidKey: string;
}

export interface ConfigModel {
  firebase: FirebaseOptions;
  vapidKey: string;
  snowplow: SnowplowModel;
  fcmLocation: {
    [key in StoreSourceType]: string;
  };
}

export interface SnowplowModel {
  collectorUrl: string;
  spSource: string;
}

export interface EventModel {
  action: any;
  notification: any;
  waitUntil(arg0: any): unknown;
}

export interface BikCustomerModel {
  id: number;
  partnerCustomerId?: number;
}
