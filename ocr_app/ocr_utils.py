# ocr_utils.py
import time
import re
import numpy as np
from PIL import Image, ImageGrab
import cv2
from cnocr import CnOcr
from pycorrector import Corrector
from difflib import SequenceMatcher
import deepl
import os
import pytesseract

# Instantiate necessary objects
translator = deepl.Translator(os.environ['deeplkey']) # https://www.deepl.com/en/your-account/keys
m = Corrector()
ocr = CnOcr()

# A global variable to keep track of the last captured text
last_captured_text = None

# General Utilty Functions
def screenGrab(rect):
    """Grab a part of the screen defined by `rect` and return it as a PIL Image."""
    x, y, width, height = rect
    image = ImageGrab.grab(bbox=[x, y, x + width, y + height])
    # image.show()
    return image

def is_similar(text1, text2):
    return SequenceMatcher(None, text1, text2).ratio()

def process_image_with_inrange_and_blur(image):
    image_np = np.array(image)
    image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    lower_bound = np.array([0, 0, 0])
    upper_bound = np.array([240, 240, 240])
    mask = cv2.inRange(image_np, lower_bound, upper_bound)
    inverted_mask = cv2.bitwise_not(mask)
    blurred_image = cv2.GaussianBlur(inverted_mask, (5, 5), 0)
    return cv2.bitwise_not(blurred_image)

def translate_text(text, source_language='ZH', target_language='EN-US'):
    result = translator.translate_text(text, source_lang=source_language, target_lang=target_language)
    print("this is result:", result)
    return(result)

# Language Specific Functions
## Chinese Specific Functions
def filter_and_sort_chinese_text(captured_text, previous_text=None):
    chinese_pattern = re.compile(r'^(?!一$)[\u4e00-\u9fff]+$')
    chinese_texts = [item for item in captured_text if chinese_pattern.match(item['text'])]
    
    if not chinese_texts:
        return {"text": "", "OCR_score": 0, "similarity_score": 0, "is_similar": False}

    highest_score_text = max(chinese_texts, key=lambda x: x['score'])
    current_text = highest_score_text['text']
    current_score = highest_score_text['score']
    similarity_score = is_similar(current_text, previous_text) if previous_text else 0
    is_similar_flag = similarity_score >= 0.8
    
    return {
        "text": current_text,
        "OCR_score": current_score,
        "similarity_score": similarity_score,
        "is_similar": is_similar_flag,
        "isCorrect": m.detect(current_text),
        "Corrected Text": m.correct(current_text),
    }

## German Specific Functions
def filter_and_sort_german_text(captured_text, previous_text=None):
    """
    Processes a German text string, filters out non-German words or characters, 
    compares it to the previous text for similarity, and returns a JSON with 
    plain text, similarity flag, and similarity score.

    Args:
        captured_text (str): The captured text string.
        previous_text (str): The text of the previous word for similarity comparison.

    Returns:
        dict: An object with 'text', 'similarity_score', and 'is_similar' fields.
    """
    if not isinstance(captured_text, str):
        raise ValueError("captured_text must be a string.")

    # German regex pattern: matches valid German words (letters with umlauts and ß) and spaces
    german_pattern = re.compile(r'[a-zA-ZäöüÄÖÜß]+')

    # Strip newlines and non-German words/characters
    captured_text = captured_text.replace('\n', ' ')  # Replace newline characters with spaces
    german_words = german_pattern.findall(captured_text)  # Find all valid German words
    
    # Join valid German words into plain text
    filtered_text = ' '.join(german_words).strip()

    # If no valid German text is found, return empty result
    if not filtered_text:
        return {"text": "", "similarity_score": 0, "is_similar": False}

    # Compare current text to previous text for similarity
    similarity_score = is_similar(filtered_text, previous_text) if previous_text else 0
    is_similar_flag = similarity_score >= 0.8  # Define threshold for similarity
    
    # Return the result as a dictionary with similarity info
    return {
        "text": filtered_text,
        "similarity_score": similarity_score,
        "is_similar": is_similar_flag,
    }

# OCR functions
def capture_and_read_text(x, y, width, height, language="ZH", invert=False):
    """Capture text from a specified screen area, apply OCR, and return the result."""
    global last_captured_text  # Use the global variable to store the previous text
    screen_rect = [x, y, width, height]
    try:
        # Capture the screen area
        image = screenGrab(screen_rect)
        print(screen_rect)
        if image is not None:
            # Preprocess the image to enhance OCR accuracy
            processed_image = process_image_with_inrange_and_blur(image)
            if language == "ZH":
                # Perform OCR on the processed image
                text = ocr.ocr(processed_image)
                
                # If text is found, filter and sort it; otherwise, return an empty string
                if text:
                    # Pass the previous text to the filtering function
                    filtered_text = filter_and_sort_chinese_text(text, previous_text=last_captured_text)
                    
                    # Update the global variable with the current captured text
                    last_captured_text = filtered_text["text"]
                    
                    print(filtered_text)  # For debugging purposes, print the filtered result
                    return {'text': filtered_text, 'Corrected Text': filtered_text}  # Return filtered text
            elif language == "DE":
                # Perform OCR for German
                text = pytesseract.image_to_string(Image.fromarray(processed_image), lang='deu').strip()
                if text:
                    filtered_text = filter_and_sort_german_text(text, previous_text=last_captured_text)
                    
                    # Update the global variable with the current captured text
                    last_captured_text = filtered_text["text"]
                    
                    print(filtered_text)  # For debugging purposes, print the filtered result
                    return {'text': filtered_text, 'Corrected Text': filtered_text}  # Return filtered text
            else:
                print("No text detected in the current frame.")
                return {'text': '', 'Corrected Text': ''}  # Return empty string if no text is detected
        else:
            print("Failed to capture the screen area.")
            return {'text': '', 'Corrected Text': ''}  # Return empty string if image capture fails
    
    except Exception as e:
        print("An error occurred:", str(e))
        return {'text': '', 'Corrected Text': ''}  # Return empty string if an error occurs

