import {BaseRoute} from "./BaseRoute.js";
import {gatherBrowserData} from "../metricData/getBrowserData.js";

export class UserApi extends BaseRoute {
    async fetchAllUsers() {
        return this.requestWrapper({
            method: 'get',
            url: '/users'
        });
    }

    async createNewUserAndSession(userSessionDTO) {
        return this.requestWrapper({
            method: 'post',
            url: '/users/new',
            data: userSessionDTO
        });
    }
    async startNewUserSession( websiteId) {
        const data = await gatherBrowserData()
        console.log(data)
        const userSessionDTO = {
            userDemographicInfo:JSON.stringify(data) ,
            websiteId:websiteId
        };

        this.createNewUserAndSession(userSessionDTO)
            .then(response => {
                console.log("New user and session created successfully:", response);
                localStorage.newSession = JSON.stringify(response);
                // You can also store the returned User and Session info in a global state or cookie
                // if you need to use it in subsequent requests.
            })
            .catch(error => {
                console.error("Error creating new user and session:", error);
            });
    }
}
