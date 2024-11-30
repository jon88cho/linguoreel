
# OCR Language Extension

This project is a Chrome extension integrated with an OCR (Optical Character Recognition) system that allows users to select a language (Chinese or German) and extract text from screen captures. It supports text translation using the DeepL API and performs text processing based on the language choice.

## Installation

### 1. Install Python 3.10
Make sure you have Python 3.10 installed on your system. You can download it from the [official Python website](https://www.python.org/downloads/release/python-3100/) or install it using a package manager:

#### For macOS:
```bash
brew install python@3.10
```

#### For Ubuntu:
```bash
sudo apt-get update
sudo apt-get install python3.10
```

### 2. Install Tesseract OCR
You need to install the Tesseract OCR tool to process images for text extraction. The extension uses the Python library `pytesseract` to interface with Tesseract.

#### For macOS:
```bash
brew install tesseract
```

#### For Ubuntu:
```bash
sudo apt-get install tesseract-ocr
```

You can also check the [official pytesseract page](https://pypi.org/project/pytesseract/) for more installation details.

### 3. Install Required Python Packages
Navigate to the project directory and install the necessary Python packages using `pip`. You can do this by running the following command:

```bash
pip install -r requirements.txt
```

This will install all dependencies listed in `requirements.txt`.

### 4. Set the DeepL API Environment Variable
This project integrates with the DeepL API for text translation. You'll need to set an environment variable to provide your DeepL API key.

#### On macOS/Linux:
You can set the environment variable in your terminal session using:
```bash
export DEEPL_API_KEY="your_deepL_api_key"
```

#### On Windows:
Set the environment variable through the Command Prompt or PowerShell:
```powershell
setx DEEPL_API_KEY "your_deepL_api_key"
```

Replace `your_deepL_api_key` with the actual API key you receive from [DeepL](https://www.deepl.com/pro).

## Usage

### 1. Load the Chrome Extension
To load the extension in Chrome, follow these steps:
1. Open Chrome and navigate to `chrome://extensions/`.
2. Enable **Developer mode** at the top right of the page.
3. Click **Load unpacked**.
4. Select the `popup.html` file from your project directory.

You should now see the extension icon in your browser's toolbar.

For more detailed instructions, refer to the [Chrome Extensions documentation](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world).

### 2. Run the Server
Once the extension is loaded, you can run the server to handle OCR requests. Make sure you're in the project directory, then run the following command to start the server:

```bash
python server.py
```

This will start the backend server that handles OCR text extraction and translation.

## Additional Notes

- The extension uses the Tesseract OCR engine to process images and extract text.
- It supports two languages: Chinese (ZH) and German (DE). The user can select the language from a dropdown in the popup.
- The DeepL API is used for translating the extracted text, and the `selectedLanguage` variable is used to set the target language.

Feel free to contribute to the project or ask for further assistance if needed.

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
