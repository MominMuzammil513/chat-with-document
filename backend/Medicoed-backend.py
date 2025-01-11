from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import PyPDF2
import os
import json
import requests

app = Flask(__name__)
CORS(app)

# Environment variables
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

# In-memory storage for PDF contents
pdf_contents = {}

@app.route('/api/upload-and-chat', methods=['POST'])
def upload_and_chat():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file and file.filename.endswith('.pdf'):
        # Process PDF
        pdf_reader = PyPDF2.PdfReader(file)
        content = ""
        for page in pdf_reader.pages:
            content += page.extract_text() + "\n"

        # Store processed content
        pdf_contents[file.filename] = content
        return jsonify({"message": "PDF uploaded and processed successfully"}), 200

    return jsonify({"error": "Invalid file format"}), 400

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if 'filename' not in data or 'message' not in data or 'language' not in data:
        return jsonify({"error": "Missing filename, message, or language"}), 400

    filename = data['filename']
    user_message = data['message']
    selected_language = data['language']

    if filename not in pdf_contents:
        return jsonify({"error": "PDF not found"}), 404

    # Prepare context for Gemini
    context = (
        f"Based on the following PDF content:\n\n{pdf_contents[filename][:2000]}\n\n"
        f"User: {user_message}\n"
        f"AI: Respond only in {selected_language} language. Format your response with proper headings, bullet points, and code blocks where necessary."
    )

    def generate():
        try:
            # Make a request to the Gemini API
            response = requests.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [{"text": context}]
                    }]
                }
            )
            if response.status_code != 200:
                yield json.dumps({"error": f"Gemini API error: {response.text}"}) + "\n"
                return

            # Stream the response
            gemini_response = response.json()
            if "candidates" in gemini_response and gemini_response["candidates"]:
                for candidate in gemini_response["candidates"]:
                    if "content" in candidate and "parts" in candidate["content"]:
                        for part in candidate["content"]["parts"]:
                            if "text" in part:
                                # Format the response before sending it to the frontend
                                formatted_response = part["text"]
                                yield json.dumps({"chunk": formatted_response}) + "\n"
            else:
                yield json.dumps({"error": "No valid response from Gemini"}) + "\n"
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return Response(stream_with_context(generate()), content_type='application/json')

if __name__ == '__main__':
    app.run(debug=True)