import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from rag import (
    ingest_document, generate_summary, generate_quiz, delete_document_vectors,
    generate_flashcards, generate_notes, chat_with_document
)

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/ingest', methods=['POST'])
def ingest():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        document_id = data.get('document_id')
        file_path = data.get('file_path')

        if not document_id or not file_path:
            return jsonify({"error": "Missing document_id or file_path"}), 400

        if not os.path.exists(file_path):
            return jsonify({"error": f"File not found at {file_path}"}), 404

        ingest_document(document_id, file_path)
        return jsonify({"message": "Document ingested successfully"}), 200

    except Exception as e:
        print("❌ Ingest Error:", str(e))
        return jsonify({"error": "Failed to ingest document"}), 500


@app.route('/generate-summary', methods=['POST'])
def generate_summary_route():
    try:
        data = request.get_json()
        document_id = data.get('document_id')

        if not document_id:
            return jsonify({"error": "document_id is required"}), 400

        summary = generate_summary(document_id)
        return jsonify({"summary": summary}), 200

    except Exception as e:
        print("❌ Generate Summary Error:", str(e))
        return jsonify({"error": "Internal RAG service error"}), 500


@app.route('/generate-quiz', methods=['POST'])
def generate_quiz_route():
    try:
        data = request.get_json()
        document_id = data.get('document_id')

        if not document_id:
            return jsonify({"error": "document_id is required"}), 400

        quiz = generate_quiz(document_id)
        return jsonify({"quiz": quiz}), 200

    except Exception as e:
        print("❌ Generate Quiz Error:", str(e))
        return jsonify({"error": "Internal RAG service error"}), 500


@app.route('/generate-flashcards', methods=['POST'])
def generate_flashcards_route():
    try:
        data = request.get_json()
        document_id = data.get('document_id')

        if not document_id:
            return jsonify({"error": "document_id is required"}), 400

        flashcards = generate_flashcards(document_id)
        return jsonify({"flashcards": flashcards}), 200

    except Exception as e:
        print("❌ Generate Flashcards Error:", str(e))
        return jsonify({"error": "Internal RAG service error"}), 500


@app.route('/generate-notes', methods=['POST'])
def generate_notes_route():
    try:
        data = request.get_json()
        document_id = data.get('document_id')

        if not document_id:
            return jsonify({"error": "document_id is required"}), 400

        notes = generate_notes(document_id)
        return jsonify({"notes": notes}), 200

    except Exception as e:
        print("❌ Generate Notes Error:", str(e))
        return jsonify({"error": "Internal RAG service error"}), 500


@app.route('/chat', methods=['POST'])
def chat_route():
    try:
        data = request.get_json()
        document_id = data.get('document_id')
        message = data.get('message')

        if not document_id or not message:
            return jsonify({"error": "document_id and message are required"}), 400

        response = chat_with_document(document_id, message)
        return jsonify({"response": response}), 200

    except Exception as e:
        print("❌ Chat Error:", str(e))
        return jsonify({"error": "Internal RAG service error"}), 500


@app.route('/reset', methods=['POST'])
def reset_db():
    try:
        data = request.get_json()
        document_id = data.get('document_id')
        
        if document_id:
            print(f"🔄 Resetting vectors for document: {document_id}")
            delete_document_vectors(document_id)
            return jsonify({"message": f"Vectors for {document_id} removed"}), 200
        else:
            return jsonify({"error": "document_id required"}), 400
    except Exception as e:
        print(f"❌ Reset Error for {document_id if 'document_id' in locals() else 'unknown'}:", str(e))
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    api_key_status = "set" if api_key else "missing"
    return jsonify({
        "status": "healthy",
        "api_key": api_key_status,
        "api_key_preview": f"{api_key[:4]}...{api_key[-4:]}" if api_key else None,
        "service": "rag_service",
        "working_dir": os.getcwd()
    }), 200


if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if not key:
        print("❌ WARNING: No API Key found. RAG will fail.")
    else:
        print(f"✅ API Key detected: {key[:4]}...{key[-4:]}")

    app.run(host='0.0.0.0', port=port, threaded=True)
