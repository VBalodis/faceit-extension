chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log("MESSAGE:", message);

    if (message.type === "GET_PLAYER") {

        fetch(`https://faceit-extension.vercel.app/api/faceit/player?nickname=${message.nickname}`)
            .then(r => {
                console.log("STATUS:", r.status);
                return r.json();
            })
            .then(data => {
                console.log("DATA:", data);
                sendResponse(data);
            })
            .catch(err => {
                console.error("FETCH ERROR:", err);
                sendResponse({ error: err.message });
            });

        return true;
    
    }

    if (message.type === "GET_DEATHNOTE") {

    fetch(`https://faceit-extension.vercel.app/api/deathnote/player/${message.playerId}`)
        .then(r => {
            console.log("STATUS:", r.status);
            return r.json()
        })
        .then(data => {
            console.log("DATA", data);
            sendResponse(data);
        })
        .catch(err => {
            console.error("FETCH ERROR:", err);
            sendResponse({ error: err.message });
        });
        return true
    }
});

