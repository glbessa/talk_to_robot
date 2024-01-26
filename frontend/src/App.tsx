import './App.css'

import { useState, useRef } from 'react'

function App() {
  const mimeType = 'audio/webm';

  const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<MediaRecorder>();
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [audioChunks, setAudioChunks] = useState<any[]>([]);
  const [audio, setAudio] = useState<string>('');

  const getMicrophonePermission = async () => {
    if ("MediaRecorder" in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
        setPermission(true);
        setStream(streamData);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      alert("The MediaRecorder API is not supported in your browser!");
    }
  };

  const startRecording = () => {
    setRecordingStatus("recording");

    if (!stream) {
      return;
    }

    const media = new MediaRecorder(stream);
    mediaRecorder.current = media;

    mediaRecorder.current.start();

    let localAudioChunks: any[] = [];
    mediaRecorder.current.ondataavailable = (e: any) => {
      if (typeof e.data === "undefined") return;
      if (e.data.size === 0) return;
      localAudioChunks.push(e.data);
    };

    setAudioChunks(localAudioChunks);
  };

  const stopRecording = () => {
    if (!mediaRecorder.current) return;

    setRecordingStatus("inactive");
    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType })
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudio(audioUrl);
      setAudioChunks([]);
    };
  }

  return (
    <>
      <div id="chat_container">
        <div className="audio-controls">
          {!permission ? (
            <button onClick={getMicrophonePermission} type="button">
                Get Microphone
            </button>
          ) : null}
          {permission && recordingStatus === "inactive" ? (
            <button onClick={startRecording} type="button">
                Start Recording
            </button>
          ) : null}
          {recordingStatus === "recording" ? (
            <button onClick={stopRecording} type="button">
                Stop Recording
            </button>
          ) : null}
        </div>
        <div className="audio-container">
          {audio ? (
            <audio src={audio} controls></audio>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default App
