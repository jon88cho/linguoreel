// popup.js
document.addEventListener('DOMContentLoaded', function () {
    const languageSelect = document.getElementById('language-select');
    // When the dropdown value changes, update the variable
    languageSelect.addEventListener('change', function () {
        const selectedLanguage = languageSelect.value;
        // Save the selected language to chrome storage
        chrome.storage.local.set({ selectedLanguage: selectedLanguage }, function() {
            console.log('Selected language saved:', selectedLanguage);
        });
    });
});
document.getElementById("start-selection").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["selection.js"]
    });
});

