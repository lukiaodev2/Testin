import "./App.css";
import React, { useEffect, useRef, useState } from "react";

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedChunks: Blob[] = [];

  // Obtener dispositivos de cámara
  useEffect(() => {
    const getVideoDevices = async () => {
      const devicesList = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devicesList.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      alert(`${videoDevices.length}, esto-->,${videoDevices.length - 1}`);
      if (videoDevices.length > 0) {
        startStream(videoDevices[0].deviceId);
      }
    };
    getVideoDevices();
  }, []);

  // Iniciar el stream de la cámara
  const startStream = async (deviceId: string) => {
    if (videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId },
        audio: true,
      });
      videoRef.current.srcObject = stream;
    }
  };

  // Cambiar entre dispositivos de cámara
  const switchCamera = () => {
    const newIndex = currentDeviceIndex === 0 ? devices.length - 1 : 0;
    setCurrentDeviceIndex(newIndex);
    if (devices[newIndex]) {
      startStream(devices[newIndex].deviceId);
    }
  };

  // Iniciar la grabación
  const startRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        setRecordingUrl(URL.createObjectURL(blob));
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    }
  };

  // Detener la grabación
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "50%" }}
        />
        <div>
          <button onClick={startRecording} disabled={isRecording}>
            Iniciar grabación
          </button>
          <button onClick={switchCamera} disabled={!isRecording}>
            Cambiar cámara
          </button>
          <button onClick={stopRecording} disabled={!isRecording}>
            Detener grabación
          </button>
        </div>
        {recordingUrl && (
          <div>
            <h3>URL de la grabación:</h3>
            <a href={recordingUrl} download="grabacion.webm">
              Descargar grabación
            </a>
          </div>
        )}

        {/* Descargar video */}
        {recordingUrl && (
          <div>
            <video src={recordingUrl} controls></video>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
