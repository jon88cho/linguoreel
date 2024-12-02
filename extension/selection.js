(() => {
    function styleButton(button, bgColor = "#007BFF", hoverColor = "#0056b3") {
        button.style.padding = "10px 20px";
        button.style.backgroundColor = bgColor;
        button.style.color = "#ffffff";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.fontSize = "16px";
        button.style.fontWeight = "bold";
        button.style.cursor = "pointer";
        button.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
        button.style.transition = "background-color 0.3s ease, transform 0.2s ease";
    
        button.addEventListener("mouseover", () => {
            button.style.backgroundColor = hoverColor;
            button.style.transform = "scale(1.05)";
        });
        button.addEventListener("mouseout", () => {
            button.style.backgroundColor = bgColor;
            button.style.transform = "scale(1)";
        });
        button.addEventListener("mousedown", () => {
            button.style.transform = "scale(0.95)";
        });
        button.addEventListener("mouseup", () => {
            button.style.transform = "scale(1)";
        });
    }
    function styleHeader (header) {
        header.style.position = "absolute";
        header.style.top = "0";
        header.style.left = "0";
        header.style.width = "100%";
        header.style.height = "40px"; // Increased height for better usability
        header.style.backgroundColor = "#f4f4f9"; // Light gray for contrast
        header.style.borderBottom = "1px solid #ddd"; // Subtle separator line
        header.style.cursor = "move";
        header.style.padding = "10px"; // Proper padding for the header text
        header.style.boxSizing = "border-box";
        header.style.fontWeight = "bold"; // Bold text for clarity
        header.style.color = "#555"; // Neutral text color
        header.style.display = "flex";
        header.style.alignItems = "center"; // Center-align text vertically
        header.style.zIndex = "10100"; // Ensure the header is above the content
    }
    function stylePopup (popup) {
        popup.style.width = "300px"; // Slightly wider for better usability
        popup.style.height = "350px"; // Adjusted height for content space
        popup.style.padding = "15px"; // Increased padding for cleaner layout
        popup.style.border = "1px solid #ccc"; // Softer border color for a modern look
        popup.style.borderRadius = "8px"; // Rounded corners
        popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Subtle shadow for depth
        popup.style.backgroundColor = "#ffffff"; // Clean white background
        popup.style.zIndex = "10000";
        popup.style.fontSize = "16px";
        popup.style.color = "#333";
        popup.style.resize = "both"; // Allow resizing
        popup.style.overflow = "auto"; // Allow scrolling if content overflows
    }
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
        popup.style.left = "10px";
        popup.style.top = "10px";
        stylePopup(popup)

        // Creating a header for dragging the popup
        const header = document.createElement("div");
        styleHeader(header)
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
        textContainer.style.height = "calc(100% - 80px)"
        textContainer.style.overflowY = "auto"; // Make text container scrollable
        textContainer.style.paddingTop = "40px"; // Adjust for header height
        textContainer.innerHTML = "OCR Output:<br>Waiting for OCR...";

        popup.appendChild(textContainer);

        // Adding save/lookup/translate buttons
        const buttonContainer = document.createElement("div");
        buttonContainer.style.position = "absolute"; // Fix position within the popup
        buttonContainer.style.bottom = "10px"; // Distance from the bottom of the popup
        buttonContainer.style.left = "10px"; // Distance from the left (adjust if needed)
        buttonContainer.style.right = "10px"; // Distance from the right (adjust if needed)
        buttonContainer.style.display = "flex";
        buttonContainer.style.justifyContent = "space-between"; // Space buttons out evenly
        buttonContainer.style.marginTop = "10px"; // Optional, can remove if unnecessary
        buttonContainer.style.padding = "5px"; // Optional, to give some space around buttons

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
                const buttons = [saveButton, lookupButton, translateButton];
                // Apply styles to all buttons
                buttons.forEach(button => {
                    styleButton(button);
                });
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
                            translationPopup.style.zIndex = "10000";
                            stylePopup(translationPopup)
                        
                            const header = document.createElement("div");
                            styleHeader(header)
                        
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
                        if (selectedLanguage=="ZH") {
                            translationText.innerHTML = `<b>${selectedText}</b>: ${response.translatedText} (${response.pinyinResult})`;
                        }
                        if (selectedLanguage=="DE") {
                            translationText.innerHTML = `<b>${selectedText}</b>: ${response.translatedText}`;
                        }
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
                            OCRresponse += `${newText}<br>`;
                            textContainer.innerHTML = `<b>Transcript:</b><br>${OCRresponse}`;
                        }
                    }
                    // Scroll to the bottom after updating the content
                    textContainer.scrollTop = textContainer.scrollHeight;
                }
            );
        }, 1000);
    });
})();
