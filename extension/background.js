chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "selection") {
        // Send selection data to the local server
        fetch("http://localhost:5001/set-selection", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                x: request.x,
                y: request.y,
                width: request.width,
                height: request.height,
                language: request.language
            })
        })
            .then(response => {
                if (!response.ok) throw new Error("Server not reachable");
                return response.json();
            })
            .then(data => {
                // Check the is_similar field in the response
                if (data.text && data.text.is_similar === false) {
                    sendResponse({ text: data.text });
                    console.log("New OCR Text from server:", data.text);
                } else {
                    console.log("Similar text ignored:", data.text);
                    sendResponse({ text: "" }); // Send an empty response for similar text
                }
            })
            .catch(error => {
                console.log("Local server not running. Using mock response.");

                // // Mock OCR response for testing purposes
                // const mockData = {
                //     text: `Mock OCR Output ${Math.random().toString(36).substring(2, 8)}`,
                //     is_similar: false // Mock is_similar field for testing
                // };

                // if (mockData.is_similar === false) {
                //     // sendResponse({ text: mockData });
                //     // console.log("Mock OCR response:", mockData);
                // } else {
                //     console.log("Mock similar text ignored:", mockData);
                //     sendResponse({ text: "" }); // Send an empty response for similar mocks
                // }
            });

        // Returning true to indicate asynchronous response
        return true;
    }

    if (request.message === "translate") {
        fetch("http://localhost:5001/get-translation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: request.text,
                language: request.language, // Include the language parameter
            }),
        })
            .then(response => {
                if (!response.ok) throw new Error("Server not reachable");
                return response.json();
            })
            .then(data => {
                if (data && data.translatedText) {
                    sendResponse({ translatedText: data.translatedText });
                    console.log("Translated text:", data.translatedText);
                } else {
                    console.log("No translation provided:", data);
                    sendResponse({ translatedText: "" });
                }
            })
            .catch(error => {
                console.log("Local server not running. Using mock translation.");
                const mockTranslation = `Translated Mock: ${request.text}`;
                sendResponse({ translatedText: mockTranslation });
                console.log("Mock translation response:", mockTranslation);
            });
    
        return true; // Indicate asynchronous response
    }
    
});
