import { Messaging, onMessage } from "firebase/messaging";
import { EventModel } from "./model";

global.setUpSnowPlowTracker = (
  r: boolean,
  snowplowCollectorUrl: string,
  bikCustomerId: string
) => {
  const _window = window as any;
  var sp_clean_obj = function (o) {
    return o && (o.schema ? delete o.schema : o.shift()) && o;
  };
  sp_clean_obj = sp_clean_obj;
  (function (p: any, l, o, w, i, n, g) {
    if (!p[i]) {
      p.GlobalSnowplowNamespace = p.GlobalSnowplowNamespace || [];
      p.GlobalSnowplowNamespace.push(i);
      p[i] = function () {
        (p[i].q = p[i].q || []).push(arguments);
      };
      p[i].q = p[i].q || [];
      n = l.createElement(o);
      g = l.getElementsByTagName(o)[0];
      n.async = 1;
      n.src = w;
      g.parentNode.insertBefore(n, g);
    }
  })(
    window,
    document,
    "script",
    `https://cdn.jsdelivr.net/gh/Bik-aiDev/snowplow-${
      r ? "" : "staging"
    }/sp.js`,
    "snowplow"
  );
  _window.snowplow("bikTracker", "sp1", snowplowCollectorUrl, {
    appId: document.location.hostname,
    platform: "web",
    cookieDomain: document.location.hostname
      .split(".")
      .reverse()
      .splice(0, 2)
      .reverse()
      .join("."),
    post: true,
    contexts: {
      webPage: true,
      performanceTiming: true,
      session: true,
    },
  });
  _window.snowplow("trackPageView");
  _window.snowplow("enableLinkClickTracking", { pseudoClicks: true });
  _window.snowplow("setUserId", bikCustomerId);
  _window.snowplow("refreshLinkClickTracking");
};

global.checkWebPushValidity = async () => {
  const _navigator = navigator as any;
  if (_navigator.brave) {
    const isBraveBrowser = await _navigator.brave.isBrave();
    return !isBraveBrowser;
  } else {
    return true;
  }
};

global.captureMessageReceiveEvent = async (
  notificationOptions,
  events: string[]
) => {
  events.forEach((eventName) => {
    const payload = {
      eventName,
      properties: {
        openedAt: new Date().toISOString(),
      },
      storeUrl: self.location.host,
      broadcastId: notificationOptions.data.broadcastId,
      customerId: notificationOptions.data.customerId,
    };
    const deliveredRaw = JSON.stringify(payload);
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: deliveredRaw,
    };

    fetch(
      notificationOptions.data.baseUrl + "/webPushApiFunctions-captureEvent",
      requestOptions
    )
      .then((response) => response.text())
      .catch((error) => console.log("error", error));
  });
};

global.setUpNotificationClickListener = () => {
  self.addEventListener(
    "notificationclick",
    function (event: EventModel | Event) {
      const _event = event as EventModel;
      console.log("Received notificationclick event");
      if (!(event as any).action) {
        var click_action = (_event as EventModel).notification.data;
        _event.notification.close();
        _event.waitUntil(window.open(click_action));
        return;
      }
      window.open(_event.action);
    }
  );
};

global.setUpFCMListener = (
  messaging: Messaging,
  events: string[],
  swFileLocation: string
) => {
  onMessage(messaging, (payload) => {
    const actions = JSON.parse(payload.data["actions"]);
    const notificationTitle = payload.data.title;
    const notificationOptions = {
      body: payload.data.body,
      icon: payload.data.icon,
      image: payload.data.image,
      title: payload.data.title,
      data: {
        url: payload.data.click_action,
        broadcastId: parseInt(payload.data.broadcast_id),
        customerId: parseInt(payload.data.customer_id),
        baseUrl: payload.data.base_url,
      },
      actions,
    };
    global.captureMessageReceiveEvent(notificationOptions, events);
    if (!actions) {
      if (!("Notification" in window)) {
        console.log("This browser does not support system notifications.");
      } else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(
          notificationTitle,
          notificationOptions
        );
        notification.onclick = function (event) {
          event.preventDefault();
          window.open(payload.fcmOptions.link, "_blank");
          notification.close();
        };
      }
      return;
    }
    navigator.serviceWorker
      .getRegistration(swFileLocation)
      .then((registration) => {
        registration.showNotification(notificationTitle, notificationOptions);
      });
  });
};

global.getShopifyCustomerId = (): string => {
  return (
    JSON.parse(
      Array.from(document.head.getElementsByTagName("script"))
        .find((script) => script.id === "__st")
        .innerHTML.split("var __st=")[1]
        .split(";")[0]
    ).cid || ""
  );
};

