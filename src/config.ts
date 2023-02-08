import { ConfigModel } from "./model";

export const config: {
  [isProd in "true" | "false"]: ConfigModel;
} = {
  true: {
    firebase: {
      apiKey: "AIzaSyA6Mi0Zii5CIimu2ogFH8wTLUYkCiDJE0E",
      authDomain: "bikayi-chat.firebaseapp.com",
      databaseURL: "https://bikayi-chat.firebaseio.com",
      projectId: "bikayi-chat",
      storageBucket: "bikayi-chat.appspot.com",
      messagingSenderId: "663068353804",
      appId: "1:663068353804:web:23c7b6577a1054f95e1529",
      serviceAccountId: "bikayi-chat@appspot.gserviceaccount.com",
    },
    vapidKey:
      "BLVUlRsEDGxjmN_wF8awekWP0RsUKeTqu_Wj_ubcppE0pwU7aWPP83L3M6V29u75iURzz1xtYl7GjT5YRVu6fOk",
    snowplow: {
      collectorUrl: "https://track.bik.ai",
      spSource: "https://cdn.jsdelivr.net/gh/Bik-aiDev/snowplow/sp.js",
    },
    fcmLocation: {
      shopify: "/apps/bik/",
      woocommerce: "/bik/",
    },
  },
  false: {
    firebase: {
      apiKey: "AIzaSyD1PQW26YUKNpXWMEpj60czm1ZMfCOPl0M",
      appId: "1:99091183732:web:d8f4b5df42e8d313dcb921",
      authDomain: "staging-bikayi.firebaseapp.com",
      messagingSenderId: "99091183732",
      storageBucket: "staging-bikayi.appspot.com",
      projectId: "staging-bikayi",
      serviceAccountId: "staging-bikayi@appspot.gserviceaccount.com",
      databaseURL:
        "https://staging-bikayi-default-rtdb.asia-southeast1.firebasedatabase.app/",
    },
    vapidKey:
      "BIFnDLSqNdBMy7uM5bqChhbEaMha2x-ykva28PVmboCKzTrvq0lOam-c3qUFnsF0A-eqWEvYiwl3vXCXr0LleIA",
    snowplow: {
      collectorUrl: "https://track.staging.bik.ai",
      spSource: "https://cdn.jsdelivr.net/gh/Bik-aiDev/snowplow-staging/sp.js",
    },
    fcmLocation: {
      shopify: "/apps/bik-staging/",
      woocommerce: "/bik-staging/",
    },
  },
};
