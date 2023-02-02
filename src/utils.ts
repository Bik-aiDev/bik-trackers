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
global.getLocalStorageValue = (
  key: "BIK_CUSTOMER_ID" | "SENT_CUSTOMER_ID_TO_SERVER" | "WEB_PUSH_TOKEN"
) => {
  if (global.StorageKeysMap[key].location === global.STORAGE_LOCATION.COOKIE) {
    return global.getCookie(global.StorageKeysMap[key].value);
  }
  return window.localStorage.getItem(global.StorageKeysMap[key].value);
};

global.setLocalStorageValue = (
  key: "BIK_CUSTOMER_ID" | "SENT_CUSTOMER_ID_TO_SERVER" | "WEB_PUSH_TOKEN",
  value: string
) => {
  if (global.StorageKeysMap[key].location === global.TORAGE_LOCATION.COOKIE) {
    global.createCookie(global.StorageKeysMap[key].value, value);
    return;
  }
  window.localStorage.setItem(global.StorageKeysMap[key].value, value);
};

global.deleteLocalStorageValue = (
  key: "BIK_CUSTOMER_ID" | "SENT_CUSTOMER_ID_TO_SERVER" | "WEB_PUSH_TOKEN"
) => {
  if (global.StorageKeysMap[key].location === global.STORAGE_LOCATION.COOKIE) {
    global.clearCookie(global.StorageKeysMap[key].value);
    return;
  }
  window.localStorage.removeItem(global.StorageKeysMap[key].value);
};

global.createCookie = (name: string, value: string, days: number = 3650) => {
  var expires;
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toISOString();
  } else {
    expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
};

global.getCookie = (cookieName: string) => {
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

global.clearCookie = (cookieName: string) => {
  global.createCookie(cookieName, "");
};
