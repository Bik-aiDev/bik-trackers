export type StoreSourceType = "woocommerce" | "shopify";

export interface FirebaseOptions {
  apiKey: string;
  appId: string;
  messagingSenderId: string;
  projectId: string;
}

export interface BikModel {
  r: boolean;
  baseUrl: string;
  events: string[];
  source: StoreSourceType;
  isWpOpted: boolean;
}

export interface BikTrackerModel {
  baseUrl: string;
  vapidKey: string;
}

export interface ConfigModel {
  firebase: FirebaseOptions;
  vapidKey: string;
  fcmLocation: {
    [key in StoreSourceType]: string;
  };
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
