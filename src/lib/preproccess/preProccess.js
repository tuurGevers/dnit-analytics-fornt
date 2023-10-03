import ActionApi from "../api/ActionApi.js";
import WebsiteApi from "../api/WebsiteApi.js";
import { EventEmitter } from 'eventemitter3';

const actionApi = new ActionApi();
const websiteApi = new WebsiteApi();

const fetchEventEmitter = new EventEmitter();

async function fetchActionsAndWriteToFile(websiteName) {
    const website = await websiteApi.fetchWebsiteByName(websiteName);
    const actions = await actionApi.fetchByWebsiteId(website.websiteId);
    fetchEventEmitter.emit('dataFetched', actions[0].actionName);  // Emitting an event once data is fetched
}

export default function preProcessAnalytics(websiteName) {
    console.log("fetching");
    fetchActionsAndWriteToFile(websiteName);
    let websiteId;

    // Listen for the data fetched event
    fetchEventEmitter.once('dataFetched', (data) => {
        websiteId = data;
    });

    return {
        markup({content, filename}) {
            // You can now use the websiteId here
            let modifiedContent = content;
            if (modifiedContent.includes("<script>")) {
                modifiedContent = modifiedContent.replace("<script>", `<script>\n import {testCreateUserAction} from "dnit-analytics"`);
            } else {
                modifiedContent = `<script>\n import {testCreateUserAction} from "dnit-analytics"\n</script>\n` + modifiedContent;
            }

            if (websiteId && modifiedContent.includes("<button")) {
                let matches;
                const regex = /<button[^>]*id=["'](.*?)["'][^>]*?>/g;

                while ((matches = regex.exec(modifiedContent)) !== null) {
                    const originalButton = matches[0];
                    const buttonId = matches[1];

                    const modifiedButton = originalButton.replace('>', ` on:click="{()=>testCreateUserAction('${buttonId}')}">`);
                    modifiedContent = modifiedContent.replace(originalButton, modifiedButton);

                    console.log('Modified button:', modifiedButton); // To inspect the modified button content
                }
            }


            if (filename.split("/").pop() === "+page.svelte") {
                /*const imports = "  import {onMount} from \"svelte\";\n" +
                    "    import {UserApi} from \"../lib/api/UserApi.js\";\n" +
                    "    import {SessionApi} from \"../lib/api/SessionApi.js\";\n" +
                    "    import {MetricsApi} from \"../lib/api/MetricsApi.js\";\n" +
                    "    import axios from \"axios\";"*/

                const imports = `
    ${modifiedContent.includes("onMount")?'':'import { onMount } from "svelte"'};
    import { UserApi, SessionApi, MetricsApi } from "dnit-analytics";
    import axios from "axios";
`;

                const onMountFun = "onMount(async () => {\n" +
                    "        // Initialize the user API\n" +
                    "        const userApi = new UserApi();\n" +
                    "        const sessionApi = new SessionApi()\n" +
                    "        const metricsApi = new MetricsApi()\n" +
                    "\n" +
                    "        axios.interceptors.request.use(\n" +
                    "            (config) => {\n" +
                    "                config.metadata = { startTime: new Date().getTime() };\n" +
                    "                return config;\n" +
                    "            },\n" +
                    "            (error) => {\n" +
                    "                return Promise.reject(error);\n" +
                    "            }\n" +
                    "        );\n" +
                    "\n" +
                    "        axios.interceptors.response.use(\n" +
                    "            (response) => {\n" +
                    "                const endTime = new Date().getTime();\n" +
                    "                const duration = endTime - response.config.metadata.startTime;\n" +
                    "\n" +
                    "                const resourceLoadMetric = {\n" +
                    "                    resourceUrl: response.config.url,\n" +
                    "                    resourceType: 'xmlhttprequest', // This can be changed as per your requirement\n" +
                    "                    fetchStart: response.config.metadata.startTime,\n" +
                    "                    responseEnd: endTime,\n" +
                    "                    resourceSize: parseInt(response.headers['content-length'] || '0', 10) // This assumes the server sends the 'content-length' header\n" +
                    "                };\n" +
                    "\n" +
                    "               metricsApi.sendResourceLoadMetric(resourceLoadMetric);\n" +
                    "\n" +
                    "                return response;\n" +
                    "            },\n" +
                    "            (error) => {\n" +
                    "                if (error.response) {\n" +
                    "                    const endTime = new Date().getTime();\n" +
                    "                    const duration = endTime - error.config.metadata.startTime;\n" +
                    "\n" +
                    "                    const resourceLoadMetric = {\n" +
                    "                        resourceUrl: error.config.url,\n" +
                    "                        resourceType: 'xmlhttprequest',\n" +
                    "                        fetchStart: error.config.metadata.startTime,\n" +
                    "                        responseEnd: endTime,\n" +
                    "                        resourceSize: parseInt(error.response.headers['content-length'] || '0', 10)\n" +
                    "                    };\n" +
                    "\n" +
                    "                    metricsApi.sendResourceLoadMetric(resourceLoadMetric);\n" +
                    "                }\n" +
                    "                return Promise.reject(error);\n" +
                    "            }\n" +
                    "        );\n" +
                    "\n" +
                    "        const newSession = localStorage.getItem('newSession')\n" +
                    "            ? JSON.parse(localStorage.getItem('newSession'))\n" +
                    "            : null;\n" +
                    "        if(newSession){\n" +
                    "            const actualSession = await sessionApi.fetchSessionById(newSession.second.sessionId)\n" +
                    "            console.log(actualSession)\n" +
                    "            if(actualSession.sessionEnd){\n" +
                    "                await userApi.startNewUserSession(1);\n" +
                    "            }\n" +
                    "        }\n" +
                    "        if (!newSession) {\n" +
                    "            await userApi.startNewUserSession(1);\n" +
                    "        }\n" +
                    "        await metricsApi.gatherAndInsertPageLoadMetrics()\n" +
                    "\n" +
                    "\n" +
                    "    })"

                if (modifiedContent.includes("<script>")) {
                    modifiedContent = modifiedContent.replace("<script>", `<script> \n ${imports}\n ${onMountFun}`);
                } else {
                    modifiedContent = `<script>\n ${imports}\n ${onMountFun}\n</script>\n` + modifiedContent;
                }
            }

            return {
                code: modifiedContent,
            };
        }
    };
}
