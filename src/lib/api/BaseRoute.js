import axios from "axios";

export class BaseRoute {
    constructor() {
        this.baseUrl = 'https://api.dnit-designs.com/api';
        //this.baseUrl = 'http://localhost:8090/api';
        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-API-KEY': 'test'
            }
        });
    }

    async requestWrapper(config) {
        try {
            const response = await this.axiosInstance(config);
            return response.data;
        } catch (error) {
            console.error(`API Request Failed: ${error}`);

            throw {
                status: error.response ? error.response.status : 500,
                message: error.response ? error.response.data.message : "Unknown error occurred.",
                details: error.response ? error.response.data.details : null
            };
        }
    }
}

