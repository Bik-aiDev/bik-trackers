"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BikTracker = void 0;
var messaging_1 = require("firebase/messaging");
var app_1 = require("firebase/app");
var utils_1 = require("./utils");
var helper_1 = require("./helper");
var config_1 = require("./config");
var BikTracker = /** @class */ (function () {
    function BikTracker(payload) {
        this.askedWpPermission = false;
        this.init(payload);
    }
    BikTracker.prototype.init = function (payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.swFileLocation = "".concat(window.location.protocol, "//").concat(window.location.host).concat(config_1.config["".concat(payload.r)].fcmLocation[payload.source], "bik-webpush.js");
                this.baseUrl = payload.baseUrl;
                this.source = payload.source;
                this.initializeMessaging(payload.r);
                this.setUpListeners(payload.events);
                this.setUp(config_1.config["".concat(payload.r)].vapidKey, config_1.config["".concat(payload.r)].snowplow);
                return [2 /*return*/];
            });
        });
    };
    BikTracker.prototype.setUpListeners = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, helper_1.setUpNotificationClickListener)();
                (0, helper_1.setUpFCMListener)(this.firebaseMessaging, events, this.swFileLocation);
                return [2 /*return*/];
            });
        });
    };
    BikTracker.prototype.initializeMessaging = function (r) {
        return __awaiter(this, void 0, void 0, function () {
            var app;
            return __generator(this, function (_a) {
                app = (0, app_1.initializeApp)(config_1.config["".concat(r)].firebase);
                this.firebaseMessaging = (0, messaging_1.getMessaging)(app);
                return [2 /*return*/];
            });
        });
    };
    BikTracker.prototype.generateWebPushToken = function (vapidKey) {
        return __awaiter(this, void 0, void 0, function () {
            var isWebPushAllowed, registration, token, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, helper_1.checkWebPushValidity)()];
                    case 1:
                        isWebPushAllowed = _a.sent();
                        if (!isWebPushAllowed) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, navigator.serviceWorker.register(this.swFileLocation)];
                    case 2:
                        registration = _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 8]);
                        return [4 /*yield*/, (0, messaging_1.getToken)(this.firebaseMessaging, {
                                serviceWorkerRegistration: registration,
                                vapidKey: vapidKey,
                            })];
                    case 4:
                        token = _a.sent();
                        if (token) {
                            this.webPushToken = token;
                        }
                        else {
                            console.log("No registration token available. Request permission to generate one.");
                        }
                        return [3 /*break*/, 8];
                    case 5:
                        e_1 = _a.sent();
                        console.log("An error occurred while retrieving token. ", e_1);
                        if (!!this.askedWpPermission) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.requestPermission(vapidKey)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    BikTracker.prototype.requestPermission = function (vapidKey) {
        return __awaiter(this, void 0, void 0, function () {
            var permission;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Requesting permission...");
                        this.askedWpPermission = true;
                        return [4 /*yield*/, Notification.requestPermission()];
                    case 1:
                        permission = _a.sent();
                        if (!(permission === "granted")) return [3 /*break*/, 3];
                        console.log("Notification permission granted.");
                        return [4 /*yield*/, this.generateWebPushToken(vapidKey)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        console.log("Unable to get permission to notify.");
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BikTracker.prototype.createBikCustomer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var myHeaders, raw, requestOptions, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");
                        raw = JSON.stringify({
                            token: this.webPushToken,
                            storeUrl: window.location.host,
                            source: this.source,
                        });
                        requestOptions = {
                            method: "POST",
                            headers: myHeaders,
                            body: raw,
                        };
                        return [4 /*yield*/, fetch("".concat(this.baseUrl, "/webPushApiFunctions-registerToken"), requestOptions)];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, response.json()];
                    case 2:
                        result = _a.sent();
                        if (result.status === 200) {
                            return [2 /*return*/, result.customer];
                        }
                        else {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    BikTracker.prototype.setUpShopifyCustomerId = function () {
        var shopifyCustomerId = (0, helper_1.getShopifyCustomerId)();
        if (shopifyCustomerId &&
            (0, utils_1.getLocalStorageValue)(1 /* STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER */) !== "1") {
            this.shopifyCustomerId = shopifyCustomerId;
        }
    };
    BikTracker.prototype.setUpBikCustomer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var bikCustomer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!((this.webPushToken || this.shopifyCustomerId) &&
                            !(0, utils_1.getLocalStorageValue)(0 /* STORAGE_KEYS.BIK_CUSTOMER_ID */))) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createBikCustomer()];
                    case 1:
                        bikCustomer = _a.sent();
                        if (!!bikCustomer) {
                            if (bikCustomer.partnerData) {
                                (0, utils_1.setLocalStorageValue)(1 /* STORAGE_KEYS.SENT_CUSTOMER_ID_TO_SERVER */, "1");
                            }
                            this.bikCustomerId = "".concat(bikCustomer.id);
                            (0, utils_1.setLocalStorageValue)(0 /* STORAGE_KEYS.BIK_CUSTOMER_ID */, "".concat(bikCustomer.id));
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BikTracker.prototype.setUpWebPushToken = function (vapidKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!(0, utils_1.getLocalStorageValue)(2 /* STORAGE_KEYS.WEB_PUSH_TOKEN */)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.generateWebPushToken(vapidKey)];
                    case 1:
                        _a.sent();
                        if (this.webPushToken) {
                            (0, utils_1.setLocalStorageValue)(2 /* STORAGE_KEYS.WEB_PUSH_TOKEN */, this.webPushToken);
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        this.webPushToken = (0, utils_1.getLocalStorageValue)(2 /* STORAGE_KEYS.WEB_PUSH_TOKEN */);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BikTracker.prototype.setUp = function (vapidKey, snowplowConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setUpWebPushToken(vapidKey)];
                    case 1:
                        _a.sent();
                        this.setUpShopifyCustomerId();
                        return [4 /*yield*/, this.setUpBikCustomer()];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, helper_1.setUpSnowPlowTracker)(snowplowConfig, this.bikCustomerId)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BikTracker;
}());
exports.BikTracker = BikTracker;
global.BIK = function (bikModel) {
    new BikTracker(bikModel);
};
//# sourceMappingURL=index.js.map