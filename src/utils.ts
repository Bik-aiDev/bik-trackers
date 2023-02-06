export const enum STORAGE_KEYS {
  BIK_CUSTOMER_ID,
  SENT_CUSTOMER_ID_TO_SERVER,
  WEB_PUSH_TOKEN,
}

export const enum STORAGE_LOCATION {
  LOCAL_STORAGE,
  COOKIE,
}


export const StorageKeysMap = {
  [STORAGE_KEYS.BIK_CUSTOMER_ID]: {
    value: "bik_customer_id",
    location: STORAGE_LOCATION.LOCAL_STORAGE,
  },
  [STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER]: {
    value: "sent_customer_id_to_server",
    location: STORAGE_LOCATION.LOCAL_STORAGE,
  },
  [STORAGE_KEYS.WEB_PUSH_TOKEN]: {
    value: "web_push_token",
    location: STORAGE_LOCATION.COOKIE,
  },
};

export function getLocalStorageValue(key: STORAGE_KEYS) {
  if (StorageKeysMap[key].location === STORAGE_LOCATION.COOKIE) {
    return getCookie(StorageKeysMap[key].value);
  }
  return window.localStorage.getItem(StorageKeysMap[key].value);
}

export function setLocalStorageValue(key: STORAGE_KEYS, value: string) {
  if (StorageKeysMap[key].location === STORAGE_LOCATION.COOKIE) {
    createCookie(StorageKeysMap[key].value, value);
    return;
  }
  window.localStorage.setItem(StorageKeysMap[key].value, value);
}

export function deleteLocalStorageValue(key: STORAGE_KEYS) {
  if (StorageKeysMap[key].location === STORAGE_LOCATION.COOKIE) {
    clearCookie(StorageKeysMap[key].value);
    return;
  }
  window.localStorage.removeItem(StorageKeysMap[key].value);
}

function createCookie(name: string, value: string, days: number = 3650) {
  var expires;
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toISOString();
  } else {
    expires = "";
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(cookieName: string) {
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
}

function clearCookie(cookieName: string) {
  createCookie(cookieName, "");
}
