import {UserActionApi} from "../api/UserActionApi.js";

const userActionApi = new UserActionApi();

export function testCreateUserAction() {
    // Mock UserAction object with test values
    const mockUserAction = {
        userId: 1,          // This is a mock value, replace it as needed
        actionId: 1,        // Mock value
        websiteId: 1,       // Mock value
        elementId: "test-element",
        timestamp: new Date().toISOString(),
        additionalData: JSON.stringify({test: "data"}),
        sessionId: 1,       // Mock value
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
