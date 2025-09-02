
export const GZPlatform = {
    OS: {
        IOS: "ios",
        ANDROID: "android",
        WEB: "web",
        UNKNOWN: "unknown",
    },

    get hasFBInstant() {
        try {
            return FBInstant != null;
        } catch (error) {
            return false;
        }
    },

    // 获取当前平台
    get currentPlatform() {
        if (platform != null) {
            return platform;
        }
        try {
            platform = FBInstant.getPlatform();
        } catch (error) {
            platform = "unknown";
        }
        if (platform?.toLowerCase() === "ios") {
            platform = this.OS.IOS;
        } else if (platform?.toLowerCase() === "android") {
            platform = this.OS.ANDROID;
        } else if (platform?.toLowerCase() === "web") {
            platform = this.OS.WEB;
        } else {
            platform = this.OS.UNKNOWN;
        }
        return platform;
    },

    getOsVersion() {
        if (osVersion != null && osVersion !== "") {
            return osVersion;
        }
        osVersion =
            navigator.userAgent.match(
                /(?:Android|iPhone OS|Windows NT|Mac OS X) ([0-9._]+)/i
            )?.[1] || "";
        return osVersion;
    },

    getDefaultLanguage() {
        return navigator.language || "en-US";
    },

    //获取浏览器类型
    getBrowserType() {
        if (browserType !== null) {
            return browserType;
        }

        const ua = navigator.userAgent;

        if (ua.indexOf("Firefox") > -1) {
            browserType = "Firefox";
        } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
            browserType = "Opera";
        } else if (ua.indexOf("Edge") > -1) {
            browserType = "Edge";
        } else if (ua.indexOf("Chrome") > -1) {
            browserType = "Chrome";
        } else if (ua.indexOf("Safari") > -1) {
            browserType = "Safari";
        } else if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) {
            browserType = "IE";
        } else {
            browserType = "Unknown";
        }
        return browserType;
    },

    getDeviceModel() {
        if (deviceModel != null && deviceModel !== "") {
            return deviceModel;
        }
        // 获取 User Agent
        const ua = navigator.userAgent;
        // iOS 设备检测
        if (this.isIOS()) {
            // 匹配 iPhone 型号
            const iPhoneMatch = ua.match(
                /iPhone(?:\s+OS\s+[\d_]+)?(?:\s+like\s+Mac\s+OS\s+X)?/i
            );
            if (iPhoneMatch) {
                // 尝试获取具体型号（如 iPhone14,2 表示 iPhone 13 Pro）
                const modelMatch = ua.match(/iPhone\s*([^;\s)]+)/i);
                deviceModel = modelMatch ? `iPhone ${modelMatch[1]}` : "iPhone";
                return deviceModel;
            }

            // 匹配 iPad 型号
            const iPadMatch = ua.match(
                /iPad(?:\s+OS\s+[\d_]+)?(?:\s+like\s+Mac\s+OS\s+X)?/i
            );
            if (iPadMatch) {
                const modelMatch = ua.match(/iPad\s*([^;\s)]+)/i);
                deviceModel = modelMatch ? `iPad ${modelMatch[1]}` : "iPad";
                return deviceModel;
            }
            deviceModel = "iOS Device";
            return deviceModel;
        }

        // Android 设备检测
        if (this.isAndroid()) {
            // 尝试匹配设备型号
            const match =
                ua.match(/\(Linux;[^)]+\) ([^)]+)\)/i) ||
                ua.match(/;\s*([^;)]+(?:\s+Build|\)))/i);
            if (match) {
                // 清理型号字符串
                deviceModel = match[1]
                    .replace(/\s+Build.*$/, "") // 移除 Build 标记
                    .replace(/\s*\([^)]*\)/g, "") // 移除括号内容
                    .replace(/[_\s]+/g, " ") // 规范化空格
                    .trim();
                return deviceModel;
            }
            // 如果无法匹配到具体型号，返回Android
            deviceModel = "Android Device";
            return deviceModel;
        }

        //web平台，从agent中提取device model
        if (this.isWeb()) {
            const macMatch = ua.match(/Macintosh; Intel Mac OS X ([0-9._]+)/i);
            if (macMatch) {
                deviceModel = `Mac ${macMatch[1]}`;
                return deviceModel;
            }
            const windowsMatch = ua.match(/Windows NT ([0-9._]+)/i);
            if (windowsMatch) {
                deviceModel = `Windows ${windowsMatch[1]}`;
                return deviceModel;
            }
            const linuxMatch = ua.match(/Linux/i);
            if (linuxMatch) {
                deviceModel = "Linux";
                return deviceModel;
            }
            deviceModel = "Web Device";
            return deviceModel;
        }

        // Web 平台或无法识别的设备
        deviceModel = "Unknown Device";
        return deviceModel;
    },

    getCountryCode() {
        // 浏览器语言设置
        try {
            const language = navigator.language;
            const countryCode = language.split("-")[1] || language;
            return countryCode;
        } catch (error) {
            console.error("Error getting country from language:", error);
        }
        return "None";
    },

    // 检查是否是 iOS
    isIOS() {
        return this.currentPlatform === this.OS.IOS;
    },

    // 检查是否是 Android
    isAndroid() {
        return this.currentPlatform === this.OS.ANDROID;
    },

    isWeb() {
        return this.currentPlatform === this.OS.WEB;
    },

    // 检查是否是移动设备
    isMobile() {
        return this.isIOS || this.isAndroid;
    },

    getAgent() {
        if (this.isWeb()) {
            return navigator.userAgent;
        }
        return "";
    },

    uuid: generate16CharUUID(),

    getLocalId() {
        const key = "revsdk_local_id";
        let id = localStorage.getItem(key);
        if (id == null) {
            id = generate16CharUUID();
            localStorage.setItem(key, id);
        }
        return id;
    },

    get isFirstLaunch() {
        if (firstLaunch == null) {
            const key = "fu_first_luanch_ts";
            const launchStr = window.localStorage.getItem(key);
            firstLaunch = launchStr == null;
            if (firstLaunch) {
                window.localStorage.setItem(key, Date.now().toString());
            }
        }
        return firstLaunch;
    },

    get getFirstLaunchTime() {
        const key = "fu_first_luanch_ts";
        const launchStr = window.localStorage.getItem(key);
        return launchStr == null ? 0 : parseInt(launchStr);
    },
};

function generate16CharUUID() {
    try {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, (byte) =>
            ("0" + byte.toString(16)).slice(-2)
        ).join("");
    } catch (error) {
        return "";
    }
}

let platform: string | null = null;
let deviceModel: string | null = null;
let osVersion: string | null = null;
let browserType: string | null = null;

let firstLaunch: boolean | null = null;
