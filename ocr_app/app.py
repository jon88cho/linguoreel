from flask import Flask, request, jsonify
from flask_cors import CORS
from ocr_utils import capture_and_read_text, translate_text

app = Flask(__name__)
CORS(app, resources={r"/set-selection": {"origins": "*"}})

@app.route('/set-selection', methods=['POST'])
def set_selection():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        x, y, width, height, language = data['x'], data['y'], data['width'], data['height'], data['language']
        text_data = capture_and_read_text(x, y, width, height, language)
        # Check that all fields are present
        if None in [x, y, width, height]:
            return jsonify({"error": "Missing fields in JSON data"}), 400

        # Placeholder response for testing
        return jsonify({"text": text_data['text'], "corrected_text": text_data['Corrected Text']}), 200

    except Exception as e:
        # Log the error and return a 500 response
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/get-translation', methods=['POST'])
def get_translation():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({"error": "No text provided"}), 400

        text = data['text']
        language = data.get('language', 'EN')  # Default to English if no language specified

        # Perform the translation
        translated_text = translate_text(text, source_language=language)

        if not hasattr(translated_text, 'text'):
            return jsonify({"error": "Translation service did not return valid text"}), 500

        response = {
            "originalText": text,
            "translatedText": translated_text.text,
        }
        return jsonify(response), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

    
if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5001)
