import { ConfigModel } from "./model";

export const config: {
  [isProd in "true" | "false"]: ConfigModel;
} = {
  true: {
    firebase: {
      apiKey: "AIzaSyA6Mi0Zii5CIimu2ogFH8wTLUYkCiDJE0E",
      projectId: "bikayi-chat",
      messagingSenderId: "663068353804",
      appId: "1:663068353804:web:23c7b6577a1054f95e1529",
    },
    vapidKey:
      "BLVUlRsEDGxjmN_wF8awekWP0RsUKeTqu_Wj_ubcppE0pwU7aWPP83L3M6V29u75iURzz1xtYl7GjT5YRVu6fOk",
    fcmLocation: {
      shopify: "/apps/bik/",
      woocommerce: "/bik/",
    },
  },
  false: {
    firebase: {
      apiKey: "AIzaSyD1PQW26YUKNpXWMEpj60czm1ZMfCOPl0M",
      appId: "1:99091183732:web:d8f4b5df42e8d313dcb921",
      messagingSenderId: "99091183732",
      projectId: "staging-bikayi",
    },
    vapidKey:
      "BIFnDLSqNdBMy7uM5bqChhbEaMha2x-ykva28PVmboCKzTrvq0lOam-c3qUFnsF0A-eqWEvYiwl3vXCXr0LleIA",
    fcmLocation: {
      shopify: "/apps/bik-staging/",
      woocommerce: "/bik-staging/",
    },
  },
};
