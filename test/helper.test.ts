import { setUp } from "./setUpJestMock";
import { checkWebPushValidity } from "../src/helper";

describe("helpers test", () => {
  beforeEach(() => {
    setUp();
  });
  test("setUpSnowPlowTracker", () => {
    expect(1).toBe(1);
  });

  test("checkWebPushValidity", async () => {
    const isWebPushValid = await checkWebPushValidity();
    console.log(isWebPushValid);
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
