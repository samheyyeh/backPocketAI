#!/usr/bin/env python3

import os
import openai
from openai import OpenAI
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    raise Exception("OpenAI API key not found. Please set it in your .env file.")

# Initialize Flask app
app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message")
    if not user_message:
        return jsonify({"error": "No message provided."}), 400

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant for school administrators. "
                        "Provide knowledgeable and context-aware responses for both daily tasks "
                        "and complex or crisis situations."
                    )
                },
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Extract and return the response
        bot_response = completion.choices[0].message.content.strip()
        return jsonify({"response": bot_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000, debug=True)
