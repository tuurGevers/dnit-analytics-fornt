import axios from "axios";

export async function gatherBrowserData() {
    const data = {};

    // Screen information
    data.screenWidth = window.screen.width;
    data.screenHeight = window.screen.height;
    data.screenColorDepth = window.screen.colorDepth;
    data.pixelRatio = window.devicePixelRatio;

    // Navigator (browser) information
    data.browserName = navigator.appName;
    data.browserVersion = navigator.appVersion;
    data.userAgent = navigator.userAgent;
    data.language = navigator.language || navigator.userLanguage;
    data.platform = navigator.platform;
    data.cookiesEnabled = navigator.cookieEnabled;

    // Timezone
    data.timezoneOffset = new Date().getTimezoneOffset();

    // IP Address (requires external API)
    try {
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        data.ipAddress = ipResponse.data.ip;
    } catch (error) {
    }

    // Battery information (if available)
    if (navigator.getBattery) {
        try {
            const battery = await navigator.getBattery();
            data.battery = {
                level: battery.level,
                charging: battery.charging,
                chargingTime: battery.chargingTime,
                dischargingTime: battery.dischargingTime
            };
        } catch (error) {
            console.error("Failed to fetch battery information:", error);
        }
    }

    // Network information (if available)
    if (navigator.connection) {
        data.network = {
            effectiveType: navigator.connection.effectiveType,
            rtt: navigator.connection.rtt,
            downlink: navigator.connection.downlink
        };
    }

    return data;
}

