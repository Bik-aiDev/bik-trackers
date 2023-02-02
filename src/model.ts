export type WebPushStoreSourceType = "woocommerce" | "shopify";

interface FirebaseOptions {
  apiKey: string;
  appId: string;
  authDomain: string;
  databaseURL: string;
  messagingSenderId: string;
  projectId: string;
  storageBucket: string;
}

export interface BikModel {
  r: boolean;
  baseUrl: string;
  vapidKey: string;
  config: FirebaseOptions;
  events: string[];
  source: "woocommerce" | "shopify";
  snowplowCollectorUrl: string;
}

export interface BikTrackerModel {
  baseUrl: string;
  vapidKey: string;
}

export interface EventModel {
  action: any;
  notification: any;
  waitUntil(arg0: any): unknown;
}

export interface BikCustomerModel {
  id: number;
  partnerData?: { partnerCustomerId: number };
}
