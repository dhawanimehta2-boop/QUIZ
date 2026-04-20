from flask import Flask, render_template, jsonify, request
import json
import random

app = Flask(__name__)

# Helper to load questions
def get_questions():
    with open('questions.json', 'r') as f:
        return json.load(f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/quiz/<subject>')
def quiz(subject):
    return render_template('quiz.html', subject=subject)

@app.route('/api/questions/<subject>')
def api_questions(subject):
    data = get_questions()
    subject_questions = data.get(subject, [])
    # Shuffle questions for variety
    random.shuffle(subject_questions)
    return jsonify(subject_questions[:10]) # Limit to 10 questions

@app.route('/submit', methods=['POST'])
def submit():
    user_data = request.json
    # In a real app, you'd re-verify answers against the JSON here 
    # to prevent frontend tampering.
    return jsonify({"status": "success", "score": user_data['score']})

if __name__ == '__main__':
    app.run(debug=True)
