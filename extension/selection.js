(() => {
    let startX, startY, overlay, OCRresponse = '';
    let intervalId;
    let lastOCRText = ''; // To track the last OCR capture
    const highlightedWords = []; // Array to store highlighted words
    let isDraggingPopup = false, offsetX = 0, offsetY = 0; // Dragging variables
    let selectedLanguage = "ZH"; // Default language
    // Get the selected language from storage when the popup is opened
    chrome.storage.local.get('selectedLanguage', function(result) {
        if (result.selectedLanguage) {
            // Set the dropdown value to the stored language
            selectedLanguage = result.selectedLanguage;
        }
    });
    let selectedText = ''; // Text highlighted by the user
    // Highlight text event listener
    document.addEventListener("mouseup", () => {
        const selection = window.getSelection().toString().trim();
        if (selection) {
            selectedText = selection;
        }
        // Add the code to pause the video here
        const video = document.querySelector('video');
        if (video) {
            video.pause();
        }
    });
    document.body.style.cursor = "crosshair";
    document.addEventListener("mousedown", (e) => {
        if (document.body.style.cursor !== "crosshair") return;

        startX = e.clientX;
        startY = e.clientY;

        overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.border = "2px dashed blue";
        overlay.style.backgroundColor = "rgba(0, 0, 255, 0.2)";
        overlay.style.left = `${startX}px`;
        overlay.style.top = `${startY}px`;
        overlay.style.zIndex = "10000";
        document.body.appendChild(overlay);
    });

    document.addEventListener("mousemove", (e) => {
        if (!overlay) return;

        const left = Math.min(startX, e.clientX);
        const top = Math.min(startY, e.clientY);
        const width = Math.abs(e.clientX - startX);
        const height = Math.abs(e.clientY - startY);

        overlay.style.left = `${left}px`;
        overlay.style.top = `${top}px`;
        overlay.style.width = `${width}px`;
        overlay.style.height = `${height}px`;
    });

    document.addEventListener("mouseup", () => {
        if (!overlay) return;

        const rect = overlay.getBoundingClientRect();
        overlay.remove();
        overlay = null;
        document.body.style.cursor = "default";
        const popup = document.createElement("div");
        popup.style.position = "fixed";
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + 10}px`;
        popup.style.width = "250px";
        popup.style.height = "300px";
        popup.style.padding = "10px";
        popup.style.border = "1px solid #333";
        popup.style.backgroundColor = "#f9f9f9";
        popup.style.zIndex = "10000";
        popup.style.fontSize = "16px";
        popup.style.color = "#333";
        popup.style.resize = "both";  // Allow resizing
        popup.style.overflow = "auto"; // Allow scroll if content overflows

        // Creating header for dragging the popup
        const header = document.createElement("div");
        header.style.position = "absolute";
        header.style.top = "0";
        header.style.left = "0";
        header.style.width = "100%";
        header.style.height = "30px";
        header.style.backgroundColor = "#f1f1f1";
        header.style.cursor = "move";
        header.style.padding = "5px";
        header.style.zIndex = "10100"; // Ensure the header is above content
        // Adding dragging functionality to the OCR popup
        let isDragging = false;
        header.addEventListener("mousedown", (e) => {
            isDragging = true;
            offsetX = e.clientX - popup.getBoundingClientRect().left;
            offsetY = e.clientY - popup.getBoundingClientRect().top;
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) {
                popup.style.left = `${e.clientX - offsetX}px`;
                popup.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
        });
        
        // Creating close button for the popup
        const closeButton = document.createElement("span");
        closeButton.textContent = "×";
        closeButton.style.position = "absolute";
        closeButton.style.top = "5px";
        closeButton.style.right = "10px";
        closeButton.style.fontSize = "20px";
        closeButton.style.cursor = "pointer";
        closeButton.style.color = "#333";
        closeButton.style.fontWeight = "bold";
        closeButton.onclick = () => {
            popup.remove();
            clearInterval(intervalId); // Stop OCR polling when popup is closed
        };
        header.appendChild(closeButton);

        // Appending the header to the popup
        popup.appendChild(header);

        // Adding text container below the header for OCR results
        const textContainer = document.createElement("div");
        textContainer.id = "ocr-text";
        textContainer.style.whiteSpace = "pre-wrap";
        textContainer.style.userSelect = "text";
        textContainer.style.paddingTop = "40px"; // Adjust for header height
        textContainer.innerHTML = "OCR Output:<br>Waiting for OCR...";

        popup.appendChild(textContainer);

        // Adding save/lookup/translate buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "space-between";
        buttonContainer.style.marginTop = "10px";
                // Save button
                const saveButton = document.createElement("button");
                saveButton.textContent = "Save";
                saveButton.onclick = () => {
                    chrome.runtime.sendMessage(
                        { message: "save", text: OCRresponse },
                        (response) => console.log(response?.status || "Save not acknowledged")
                    );
                };
        
                // Lookup button
                const lookupButton = document.createElement("button");
                lookupButton.textContent = "Lookup";
                lookupButton.onclick = () => {
                    if (!selectedText) {
                        alert("Please highlight text to look up.");
                        return;
                    }
                    const query = encodeURIComponent(selectedText);
                    window.open(`https://www.google.com/search?q=${query}`, '_blank');
                };
        
                // Translate button
                const translateButton = document.createElement("button");
                translateButton.textContent = "Translate";
                translateButton.onclick = () => {
                    if (!selectedText) {
                        alert("Please highlight text to translate.");
                        return;
                    }

            chrome.runtime.sendMessage(
                { message: "translate", text: selectedText, language: selectedLanguage},
                (response) => {
                    if (response && response.translatedText) {
                        let translationPopup = document.getElementById("translation-popup");
                        if (!translationPopup) {
                            translationPopup = document.createElement("div");
                            translationPopup.id = "translation-popup";
                            translationPopup.style.position = "fixed";
                            translationPopup.style.left = "10px";
                            translationPopup.style.top = "10px";
                            translationPopup.style.width = "300px";
                            translationPopup.style.height = "auto";
                            translationPopup.style.padding = "10px";
                            translationPopup.style.border = "1px solid #333";
                            translationPopup.style.backgroundColor = "#f9f9f9";
                            translationPopup.style.zIndex = "10000";
                            translationPopup.style.fontSize = "16px";
                            translationPopup.style.color = "#333";
                            translationPopup.style.resize = "both";
                            translationPopup.style.overflow = "auto";
                        
                            const header = document.createElement("div");
                            header.style.position = "absolute";
                            header.style.top = "0";
                            header.style.left = "0";
                            header.style.width = "100%";
                            header.style.height = "30px";
                            header.style.backgroundColor = "#f1f1f1";
                            header.style.cursor = "move";
                            header.style.padding = "5px";
                            header.textContent = "Translations";
                        
                            const closeTranslationPopup = document.createElement("span");
                            closeTranslationPopup.textContent = "×";
                            closeTranslationPopup.style.position = "absolute";
                            closeTranslationPopup.style.top = "5px";
                            closeTranslationPopup.style.right = "10px";
                            closeTranslationPopup.style.fontSize = "20px";
                            closeTranslationPopup.style.cursor = "pointer";
                            closeTranslationPopup.style.color = "#333";
                            closeTranslationPopup.style.fontWeight = "bold";
                            closeTranslationPopup.onclick = () => translationPopup.remove();
                        
                            header.appendChild(closeTranslationPopup);
                            translationPopup.appendChild(header);
                        
                            // Adjust the paddingTop of the content area to avoid it being hidden under the header
                            const contentArea = document.createElement("div");
                            contentArea.style.paddingTop = "35px"; // Offset for the header height
                            contentArea.innerHTML = `Translations:`;
                            translationPopup.appendChild(contentArea);
                        
                            document.body.appendChild(translationPopup);
                        
                            let isDragging = false, offsetX = 0, offsetY = 0;
                            header.addEventListener("mousedown", (e) => {
                                isDragging = true;
                                offsetX = e.clientX - translationPopup.getBoundingClientRect().left;
                                offsetY = e.clientY - translationPopup.getBoundingClientRect().top;
                                e.preventDefault();
                            });
                        
                            document.addEventListener("mousemove", (e) => {
                                if (isDragging) {
                                    translationPopup.style.left = `${e.clientX - offsetX}px`;
                                    translationPopup.style.top = `${e.clientY - offsetY}px`;
                                }
                            });
                        
                            document.addEventListener("mouseup", () => {
                                isDragging = false;
                            });
                        }
                        

                        const translationText = document.createElement("p");
                        translationText.innerHTML = `<b>${selectedText}</b>: ${response.translatedText}`;
                        translationPopup.appendChild(translationText);
                    }
                }
            );
        };

        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(lookupButton);
        buttonContainer.appendChild(translateButton);
        popup.appendChild(buttonContainer);

        document.body.appendChild(popup);

        // OCR polling logic
        intervalId = setInterval(() => {
            chrome.runtime.sendMessage(
                {
                    message: "selection",
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height,
                    language: selectedLanguage,
                },
                (response) => {
                    if (response) {
                        const newText = response.text.text;
                        if (newText && newText !== lastOCRText) {
                            lastOCRText = newText;
                            OCRresponse += `${newText} `;
                            textContainer.innerHTML = `<b>Transcript:</b><br>${OCRresponse}`;
                        }
                    }
                }
            );
        }, 1000);
    });
})();
