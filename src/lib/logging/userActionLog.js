import {UserActionApi} from "../api/UserActionApi.js";

const userActionApi = new UserActionApi();

export function testCreateUserAction() {
    const session = JSON.parse(localStorage.newSession);
    // Mock UserAction object with test values
    const mockUserAction = {
        userId: session.first.userId,          // This is a mock value, replace it as needed
        actionId: 1,        // Mock value
        websiteId: session.second.website.websiteId,       // Mock value
        elementId: "test-element",
        timestamp: new Date().toISOString(),
        additionalData: JSON.stringify({test: "data"}),
        sessionId: session.second.sessionId,       // Mock value
    };


    console.log(mockUserAction)

    userActionApi.createUserAction(mockUserAction)
        .then(response => {
            console.log("UserAction created successfully:", response);
        })
        .catch(error => {
            console.error("Error creating UserAction:", error);
        });
}
