const API_AUDIO_URL = "https://localhost:8001/api/v1/audio"
const API_TEXT_URL = "https://localhost/api/v1/text"

const txtMessage = document.getElementById("txtMessage")
const btnSend = document.getElementById("btnSend")
const btnAudioControl = document.getElementById("btnAudioControl")
const ctnMessages = document.getElementById("ctnMessages")
const audioPlayer = document.getElementById("audioPlayer")
let mediaRecorder = null;
let chunks = [];
let messages = [];

if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("MediaStream supported.");
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            }
            
            mediaRecorder.onstop = (e) => {
                console.log("recorder stopped");
            
                const blob = new Blob(chunks, { type: "audio/ogg; codecs=opus" })
                chunks = []

                sendAudioToApi(blob)
                    .then(() => {});

                const audioUrl = window.URL.createObjectURL(blob)
                audioPlayer.src = audioUrl;
            }
        })
        .catch((err) => console.error(`${err}`));
} else {
    console.log("MediaStream is not supported.");
}

const sendAudioToApi = async (blob) => {
    let formData = new FormData();
    formData.append("blob", blob);

    let resp = await fetch(API_AUDIO_URL, {
        method: "POST",
        body: formData
    });

    console.log(resp);
}

const sendTextToApi = async () => {

}

const startRecord = () => {
    mediaRecorder.start()
    console.log(mediaRecorder.state)
    btnAudioControl.onclick = stopRecord
    btnAudioControl.textContent = "Stop"
}

const stopRecord = () => {
    mediaRecorder.stop();
    console.log(mediaRecorder.state);
    btnAudioControl.onclick = startRecord
    btnAudioControl.textContent = "Record"
}

btnAudioControl.onclick = startRecord;
