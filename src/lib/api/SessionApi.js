import {BaseRoute} from "./BaseRoute.js";

export class SessionApi extends BaseRoute {
    async fetchSessionById(sessionId) {
        return this.requestWrapper({
            method: 'get',
            url: '/sessions/' + sessionId
        });
    }


}
