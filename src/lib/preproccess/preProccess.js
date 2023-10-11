import ActionApi from "../api/ActionApi.js";
import WebsiteApi from "../api/WebsiteApi.js";
import {EventEmitter} from 'eventemitter3';

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
            let imgMatches;
            const imgRegex = /<img\s*([\s\S]*?)>/g;

            while ((imgMatches = imgRegex.exec(modifiedContent)) !== null) {
                const originalImg = imgMatches[0];
                const imgAttributes = imgMatches[1];

                const imgIdMatch = imgAttributes.match(/id=(["'].*?["']|\{.*?\})/);
                const onClickImgMatch = imgAttributes.includes('on:click');

                if (!imgIdMatch) {
                    console.log("No ID found for img:", originalImg);
                    continue; // Move to the next img if no ID is found
                }

                let imgId = imgIdMatch[1];
                imgId = imgId.includes("{")?imgId.replaceAll("'","").replaceAll('"',"").replaceAll("{","").replaceAll("}",""):imgId
                let modifiedImg;

                if (onClickImgMatch) {
                    modifiedImg = originalImg.replace('<img', `<img on:click="{()=>testCreateUserAction(${imgId}, 3)}"`);
                } else {
                    modifiedImg = originalImg.replace('/>', ` on:click="{()=>testCreateUserAction(${imgId},3)}"/>`);
                }

                modifiedContent = modifiedContent.replace(originalImg, modifiedImg);
            }
            if (websiteId && modifiedContent.includes("<button")) {
                let matches;
                // This regex captures more reliably the contents of the button tag
                const regex = /<button\s*([\s\S]*?)>/g;

                while ((matches = regex.exec(modifiedContent)) !== null) {
                    const originalButton = matches[0];
                    const attributes = matches[1];

                    const idMatch = attributes.match(/id=(["'].*?["']|\{.*?\})/);
                    const onClickMatch = attributes.includes('on:click');

                    if (!idMatch) {
                        console.log("No ID found for button:", originalButton);
                        continue; // Move to the next button if no ID is found
                    }

                    let buttonId = idMatch[1];
                    buttonId = buttonId.includes("{")?buttonId.replaceAll("'","").replaceAll('"',"").replaceAll("{","").replaceAll("}",""):buttonId
                    let modifiedButton;

                    if (onClickMatch) {
                        modifiedButton = originalButton.replace('<button', `<button on:click="{()=>testCreateUserAction(${buttonId},1)}"`);
                    } else {
                        modifiedButton = originalButton.replace('>', ` on:click="{()=>testCreateUserAction(${buttonId},1)}">`);
                    }

                    modifiedContent = modifiedContent.replace(originalButton, modifiedButton);
                }
            }

            if (filename.split("/").pop() === "+page.svelte") {
                /*const imports = "  import {onMount} from \"svelte\";\n" +
                    "    import {UserApi} from \"../lib/api/UserApi.js\";\n" +
                    "    import {SessionApi} from \"../lib/api/SessionApi.js\";\n" +
                    "    import {MetricsApi} from \"../lib/api/MetricsApi.js\";\n" +
                    "    import axios from \"axios\";"*/

                const imports = `
    ${modifiedContent.includes("onMount") ? '' : 'import { onMount } from "svelte"'};
    ${modifiedContent.includes("onDestroy") ? '' : 'import { onDestroy } from "svelte"'};
    import { UserApi, SessionApi, MetricsApi } from "dnit-analytics";
    import axios from "axios";
`;

                const onMountFun = "onMount(async () => {\n" +
                    "console.log('mounted')\n" +
                    "        // Initialize the user API\n" +
                    "        const userApi = new UserApi()\n" +
                    "        const sessionApi = new SessionApi()\n" +
                    "        const metricsApi = new MetricsApi()\n" +
                    "\n" +
                    "        const newSession = localStorage.getItem('newSession')\n" +
                    "            ? JSON.parse(localStorage.getItem('newSession'))\n" +
                    "            : null;\n" +
                    "console.log(newSession)\n"+
                    "        if(newSession){\n" +
                    "            const actualSession = await sessionApi.fetchSessionById(newSession.second.sessionId)\n" +
                    "            console.log(actualSession)\n" +
                    "            if(actualSession.sessionEnd){\n" +
                    "                console.log(await userApi.startNewUserSession(1));\n" +
                    "            }\n" +
                    "        }\n" +
                    "        if (!newSession) {\n" +
                    "            await userApi.startNewUserSession(1);\n" +
                    "        }\n" +
                    "        await metricsApi.gatherAndInsertPageLoadMetrics()\n" +
                    "\n" +
                    "console.log(localStorage.newSession)\n\n" +
                    "\n" +
                    "      const requestInterceptor =   axios.interceptors.request.use(\n" +
                    "            (config) => {\n" +
                    "                config.metadata = { startTime: new Date().getTime() };\n" +
                    "                return config;\n" +
                    "            },\n" +
                    "            (error) => {\n" +
                    "                return Promise.reject(error);\n" +
                    "            }\n" +
                    "        );\n" +
                    "\n" +
                    "     const responseInterceptor =   axios.interceptors.response.use(\n" +
                    "            (response) => {\n" +
                    "                const endTime = new Date().getTime();\n" +
                    "                const duration = endTime - response.config.metadata.startTime;\n" +
                    "\n" +
                    "                const resourceLoadMetric = {\n" +
                    "                    sessionId: newSession.second.sessionId,\n" +
                    "                    resourceUrl: response.config.url,\n" +
                    "                    resourceType: 'xmlhttprequest', // This can be changed as per your requirement\n" +
                    "                    fetchStart: response.config.metadata.startTime,\n" +
                    "                    responseEnd: endTime,\n" +
                    "                    additionalMetrics: JSON.stringify({body:response.config.data, headers:response.config.headers}),\n"+
                    "                    resourceSize: parseInt(response.headers['content-length'] || '0', 10) // This assumes the server sends the 'content-length' header\n" +
                    "                };\n" +
                    "\n" +
                    "                   console.log(resourceLoadMetric)\n"+
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
                    "                    sessionId: newSession.second.sessionId,\n" +
                    "                        resourceUrl: error.config.url,\n" +
                    "                        resourceType: 'xmlhttprequest',\n" +
                    "                        fetchStart: error.config.metadata.startTime,\n" +
                    "                    additionalMetrics: JSON.stringify({body:error.config.data, headers:error.config.headers}),\n"+

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
                    "onDestroy(() => {\n" +
                    "    axios.interceptors.request.eject(requestInterceptor);\n" +
                    "    axios.interceptors.response.eject(responseInterceptor);\n" +
                    "});\n"+
                    "console.log('mount finished')\n"+
                    "    })"

                if (modifiedContent.includes("<script>")) {
                    console.log("replace script"+`<script> \n ${imports}\n ${onMountFun}\n`)
                    modifiedContent = modifiedContent.replace("<script>", `<script> \n ${imports}\n ${onMountFun}\n`);
                } else {
                    console.log("new script"+`<script>\n ${imports}\n ${onMountFun}\n</script>\n`)
                    modifiedContent = `<script>\n ${imports}\n ${onMountFun}\n</script>\n` + modifiedContent;
                }
            }

            return {
                code: modifiedContent,
            };
        }
    };
}
