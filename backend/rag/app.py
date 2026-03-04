import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from rag import ingest_document, generate_summary, generate_quiz, delete_document_vectors

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


@app.route('/reset', methods=['POST'])
def reset_db():
    try:
        data = request.get_json()
        document_id = data.get('document_id')
        
        if document_id:
            delete_document_vectors(document_id)
            return jsonify({"message": f"Vectors for {document_id} removed"}), 200
        else:
            return jsonify({"error": "document_id required"}), 400
    except Exception as e:
        print("❌ Reset Error:", str(e))
        return jsonify({"error": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    api_key_status = "set" if (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")) else "missing"
    return jsonify({
        "status": "healthy",
        "api_key": api_key_status,
        "service": "rag_service"
    }), 200


if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if not key:
        print("❌ WARNING: No API Key found. RAG will fail.")
    else:
        print(f"✅ API Key detected: {key[:4]}...{key[-4:]}")

    app.run(host='0.0.0.0', port=port, threaded=True)
