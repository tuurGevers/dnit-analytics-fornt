// MetricApi.js

import {BaseRoute} from "./BaseRoute.js";

export class MetricApi extends BaseRoute {
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

    async insertResourceLoadMetric(resourceLoadMetric) {
        return this.requestWrapper({
            method: 'post',
            url: '/resourceloadmetrics',
            data: resourceLoadMetric
        });
    }
}
