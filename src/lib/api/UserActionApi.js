import {BaseRoute} from "./BaseRoute.js";

export class UserActionApi extends BaseRoute {
    async fetchAllUserActions() {
        return this.requestWrapper({
            method: 'get',
            url: '/useractions'
        });
    }

    async createUserAction(userAction) {
        return this.requestWrapper({
            method: 'post',
            url: '/useractions',
            data: userAction
        });
    }
}

