import os
from io import BytesIO
import requests
from flask import Flask, request, make_response
import gtts
from gtts import gTTS

WHISPER_API = "https://api.openai.com/v1/audio/transcriptions"
CHATGPT_API = "https://api.openai.com/v1/chat/completions"
TOKEN = os.environ["OPENAI_TOKEN"]

AVAILABLE_LANGS = {
    'pt-br':('pt', 'com.br'),
    'en-us':('en', 'us'),
    'fr-fr':('fr', 'fr'),
    'es-mx':('es', 'com.mx'),
    'es-es':('es', 'es')
}

app = Flask(__name__)

@app.route("/api/v1/audio", methods=["POST"])
def reply():
    # pegar mensagens anteriores
    messages = request.form['messages']
    if not messages:
        messages = []

    # pegar idioma e sotaque
    language = request.form['lang']
    if language and not language in AVAILABLE_LANGS:
        resp = make_response()
        resp.data = {
            "error": f"{language} is not available yet."
        }
        resp.status_code = 501
        return resp

    # pegar audio que foi enviado
    audio = request.files.get("recorded_audio")
    if not audio:
        resp = make_response()
        resp.data = {
            "error": "audio not received."
        }
        resp.status_code = 400
        return resp

    # mandar audio para o whisper
    whisper_resp = requests.post(
        WHISPER_API,
        data= {
            "model":"whisper-1"
        },
        headers= {
            "Content-Type":"multipart/form-data",
            "Authorization":f"Bearer {TOKEN}"
        },
        files= {
            "file": audio
        }
    )
    if whisper_resp.status_code != 200:
        resp = make_response()
        resp.data = {
            "error": f"whisper error: {whisper_resp.json()}"
        }
        resp.status_code = whisper_resp.status_code
        return resp

    # pegar texto do whisper
    text = whisper_resp.json().get("text")

    messages.append({
        "role":"user",
        'content':text
    })

    # enviar texto para o gpt
    chatgpt_resp = requests.post(
        CHATGPT_API,
        data= {
            "model":"gpt-3.5-turbo",
            "messages": messages
        }
    )
    if chatgpt_resp.status_code != 200:
        resp = make_response()
        resp.data = {
            "error": f"chatgpt error: {chatgpt_resp.json()}"
        }

    # pegar resposta do gpt
    gpt_resp = resp.json().get('choices')[0].get('message')
    messages.append(gpt_resp)

    # transformar resposta em audio
    gpt_audio = BytesIO()
    tts = gTTS(gpt_resp['content'], tld='com', lang='en')
    tts.write_to_fp(gpt_audio)

    # enviar resposta em texto e audio ao usuário
    response = make_response()
    response.data = {
        'messages': messages,
        'gpt_audio': gpt_audio
    }
    return response

if __name__ == "__main__":
    app.run(host=os.environ["HOST"], port=os.environ["PORT"], debug=True)