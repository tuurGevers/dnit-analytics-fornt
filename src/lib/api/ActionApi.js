import { BaseRoute } from './BaseRoute.js';

export default class ActionApi extends BaseRoute {
    async getAllActions() {
        return this.requestWrapper({
            method: 'get',
            url: '/actions'
        });
    }

    async fetchByWebsiteId(websiteId) {
        return this.requestWrapper({
            method: 'get',
            url: '/actions/' + websiteId
        });
    }

    async createAction(action) {
        return this.requestWrapper({
            method: 'post',
            url: '/actions',
            data: action
        });
    }
}

