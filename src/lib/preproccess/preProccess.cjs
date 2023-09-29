const { ActionApi } = require("../api/ActionApi.cjs");
const { WebsiteApi } = require("../api/WebsiteApi.cjs");
const EventEmitter = require('events');

const actionApi = new ActionApi();
const websiteApi = new WebsiteApi();

const fetchEventEmitter = new EventEmitter();

async function fetchActionsAndWriteToFile(websiteName) {
    const website = await websiteApi.fetchWebsiteByName(websiteName);
    const actions = await actionApi.fetchByWebsiteId(website.websiteId);
    fetchEventEmitter.emit('dataFetched', actions[0].actionName);  // Emitting an event once data is fetched
}

function preProcess(websiteName) {
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
            if(modifiedContent.includes("<script>")){
                modifiedContent = modifiedContent.replace("<script>", `<script>\n import {testCreateUserAction} from "/src/lib/logging/userActionLog.js"`);
                console.log(modifiedContent);
            }else{
                modifiedContent = `<script>\n import {testCreateUserAction} from "/src/lib/logging/userActionLog.js"\n</script>\n` + modifiedContent;
            }
            if (websiteId && modifiedContent.includes("<button")) {
                modifiedContent = modifiedContent.replace("<button", `<button on:click="{()=>testCreateUserAction()}"`);
            }
            return {
                code: modifiedContent,
            };
        }
    };
}

module.exports.default = preProcess;
