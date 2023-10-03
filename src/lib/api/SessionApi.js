import {BaseRoute} from "./BaseRoute.js";

export default  class SessionApi extends BaseRoute {
    async fetchSessionById(sessionId) {
        return this.requestWrapper({
            method: 'get',
            url: '/sessions/' + sessionId
        });
    }


}
