import UserActionApi from "../api/UserActionApi.js";

const userActionApi = new UserActionApi();

export function testCreateUserAction(id) {
    const session = JSON.parse(localStorage.newSession);
    const mockUserAction = {
        userId: session.first.userId,
        actionId: 1,
        websiteId: session.second.website.websiteId,
        elementId: id,
        timestamp: new Date().toISOString(),
        additionalData: JSON.stringify({test: "data"}),
        sessionId: session.second.sessionId,
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
