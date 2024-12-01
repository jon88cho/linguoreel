// popup.js
document.addEventListener('DOMContentLoaded', function () {
    const languageSelect = document.getElementById('language-select');

    // Log the initial selected value
    console.log('Initial selected language:', languageSelect.value);

    // When the dropdown value changes, update the variable
    languageSelect.addEventListener('change', function () {
        const selectedLanguage = languageSelect.value;
        console.log('Language changed to:', selectedLanguage); // Debugging line
        // Save the selected language to chrome storage
        chrome.storage.local.set({ selectedLanguage: selectedLanguage }, function() {
            console.log('Selected language saved:', selectedLanguage); // Debugging line
        });
    });

    // Fetch the selected language from storage if available
    chrome.storage.local.get('selectedLanguage', function(result) {
        if (result.selectedLanguage) {
            languageSelect.value = result.selectedLanguage; // Set the selected value from storage
            console.log('Language set from storage:', result.selectedLanguage);
        }
    });
});

document.getElementById("start-selection").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["selection.js"]
    });
});

