# OCR Language Extension

This project is a Chrome extension integrated with an OCR (Optical Character Recognition) system that allows users to select a language (Chinese or German) and extract text from screen captures. It supports text translation using the DeepL API and performs text processing based on the language choice.

## Installation

### 0. Install Homebrew and git
Make sure you have Homebrew installed on your system. Open a Terminal and paste this command:
#### For macOS:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

```bash
brew install git
```

#### Git Pull Repo:
```bash
git clone https://github.com/jon88cho/linguoreel.git
```
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
brew install tesseract-lang
brew install cmake boost eigen
xcode-select --install
```

#### For Ubuntu:
```bash
sudo apt-get install tesseract-ocr
```

You can also check the [official pytesseract page](https://pypi.org/project/pytesseract/) for more installation details.

### 3. Create a Virtual Environment and Install Dependencies
Navigate to the project directory and create a virtual environment using Python 3.10:

```bash
# Change directory into Python directory
cd ocr_app
# Create a virtual environment
python3.10 -m venv ocr_env

# Activate the virtual environment
# On macOS/Linux:
source ocr_env/bin/activate

# On Windows:
ocr_env\Scripts\activate

# Install the required packages while the virtual environment is active
python3.10 -m pip install -r requirements.txt
```

#### For Apple Silicon:
```bash
CMAKE_OSX_ARCHITECTURES=arm64 python3.10 -m install https://github.com/kpu/kenlm/archive/master.zip
```

**Notes:**
- Creating a virtual environment isolates the project dependencies
- Activate the virtual environment each time you work on the project
- Use `deactivate` command to exit the virtual environment when done

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
Once the extension is loaded, you can run the server to handle OCR requests. Make sure you're in the project directory and the virtual environment is activated, then run the following command to start the server:

```bash
python3.10 app.py
```

This will start the backend server that handles OCR text extraction and translation.

## Additional Notes

- The extension uses the Tesseract OCR engine to process images and extract text.
- It currently supports two languages: Chinese (ZH) and German (DE). The user can select the language from a dropdown in the popup.
- The DeepL API is used for translating the extracted text, and the `selectedLanguage` variable is used to set the target language.

---

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.