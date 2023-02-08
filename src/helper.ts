import {
  enableLinkClickTracking,
  LinkClickTrackingPlugin,
} from "@snowplow/browser-plugin-link-click-tracking";
import {
  newTracker,
  setUserId,
  trackPageView,
} from "@snowplow/browser-tracker";
import { Messaging, onMessage } from "firebase/messaging";
import { EventModel, SnowplowModel } from "./model";

export function setUpNotificationClickListener() {
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
}

function captureMessageReceiveEvent(
  notificationOptions,
  eventsOnDelivered: string[]
) {
  eventsOnDelivered.forEach((eventName) => {
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
}

export function setUpFCMListener(
  messaging: Messaging,
  events: string[],
  swFileLocation: string
) {
  onMessage(messaging, async (payload) => {
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
    captureMessageReceiveEvent(notificationOptions, events);
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
    const swRegistration = await navigator.serviceWorker.getRegistration(
      swFileLocation
    );
    swRegistration.showNotification(notificationTitle, notificationOptions);
  });
}
export async function checkWebPushValidity() {
  const _navigator = navigator as any;
  if (_navigator.brave) {
    const isBraveBrowser = await _navigator.brave.isBrave();
    return !isBraveBrowser;
  } else {
    return true;
  }
}

export function getShopifyCustomerId(): string {
  try {
    return JSON.parse(
      Array.from(document.head.getElementsByTagName("script"))
        .find((script) => script.id === "__st")
        ?.innerHTML.split("var __st=")[1]
        .split(";")[0]
    ).cid;
  } catch (e) {
    console.log("Shopify tag missing");
    return "";
  }
}

export function setUpSnowPlowTracker(
  snowplowConfig: SnowplowModel,
  bikCustomerId: string
) {
  newTracker("bikTracker", snowplowConfig.collectorUrl, {
    appId: document.location.hostname,
    platform: "web",
    cookieDomain: document.location.hostname
      .split(".")
      .reverse()
      .splice(0, 2)
      .reverse()
      .join("."),
    contexts: {
      webPage: true,
      session: true,
    },
    plugins: [LinkClickTrackingPlugin()],
  });
  setUserId(bikCustomerId);
  trackPageView();
  enableLinkClickTracking({ pseudoClicks: true });
}

module.exports = {
  setUpFCMListener,
  setUpNotificationClickListener,
  setUpSnowPlowTracker,
  checkWebPushValidity,
  getShopifyCustomerId,
};
