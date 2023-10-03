import { BaseRoute } from './BaseRoute.js';

export default class WebsiteApi extends BaseRoute {
    async getAllWebsites() {
        return this.requestWrapper({
            method: 'get',
            url: '/websites'
        });
    }
    async fetchWebsiteByName(name) {
        return this.requestWrapper({
            method: 'get',
            url: '/websites/'+name
        });
    }

    async createWebsite(website) {
        return this.requestWrapper({
            method: 'post',
            url: '/websites',
            data: website
        });
    }
}
