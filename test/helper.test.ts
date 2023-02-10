import { setUp, setUpNavigatorForBrave } from "./setUpJestMock";
import { checkWebPushValidity } from "../src/helper";

describe("helpers test", () => {
  test("setUpSnowPlowTracker", () => {
    expect(1).toBe(1);
  });

  test("captureMessageReceiveEvent", () => {
    expect(1).toBe(1);
  });

  test("setUpNotificationClickListener", () => {
    expect(1).toBe(1);
  });

  test("setUpFCMListener", () => {
    expect(1).toBe(1);
  });

  test("getShopifyCustomerId", () => {
    expect(1).toBe(1);
  });
});

describe("web push validity test", () => {
  test("for non brave browser", async () => {
    setUpNavigatorForBrave(false);
    expect(await checkWebPushValidity()).toBe(true);
  });

  test("checkWebPushValidity for brave browser", async () => {
    setUpNavigatorForBrave(true);
    expect(await checkWebPushValidity()).toBe(false);
  });
});
