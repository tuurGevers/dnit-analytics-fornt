export function getPageLoadMetrics() {
    const metrics = {};

    // Use the Performance API to gather metrics
    const performanceData = window.performance.timing;
    const session = JSON.parse(localStorage.getItem("newSession"));
    metrics.userId = session.first.userId
    metrics.websiteId = session.second.website.websiteId
    metrics.sessionId = session.second.sessionId
    metrics.url = window.location.href;
    metrics.timeToFirstByte = performanceData.responseStart - performanceData.requestStart;
    metrics.domInteractiveTime = performanceData.domInteractive - performanceData.navigationStart;
    metrics.domCompleteTime = performanceData.domComplete - performanceData.navigationStart;
    metrics.totalLoadTime = performanceData.loadEventEnd - performanceData.navigationStart;
    metrics.additionalMetrics = "{}"
    // Add any other required metrics or data points you wish to collect

    return metrics;
}
