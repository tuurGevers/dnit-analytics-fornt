// MetricApi.js

import {BaseRoute} from "./BaseRoute.js";
import {getPageLoadMetrics} from "../metricData/getPageLoadMetrics.js";

export default  class MetricApi extends BaseRoute {
    async fetchAllPageLoadMetrics() {
        return this.requestWrapper({
            method: 'get',
            url: '/pageloadmetrics'
        });
    }

    async insertPageLoadMetric(pageLoadMetric) {
        return this.requestWrapper({
            method: 'post',
            url: '/pageloadmetrics',
            data: pageLoadMetric
        });
    }

    async fetchAllResourceLoadMetrics() {
        return this.requestWrapper({
            method: 'get',
            url: '/resourceloadmetrics'
        });
    }

    async sendResourceLoadMetric(resourceLoadMetric) {
        return this.requestWrapper({
            method: 'post',
            url: '/resourceloadmetrics',
            data: resourceLoadMetric
        });
    }

    async gatherAndInsertPageLoadMetrics() {
        const pageLoadMetric = getPageLoadMetrics();
        return this.insertPageLoadMetric(pageLoadMetric);
    }
}
