import "./App.css";
import React, { useEffect } from "react";

function App() {
  const [recording, setRecording] = React.useState(false);
  const [videoURL, setVideoURL] = React.useState(null);
  const mediaRecorderRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const chunks = React.useRef([]);

  const startRecording = async () => {
    // Solicitar permiso y acceso a la cámara
    try {
      if (videoRef && mediaRecorderRef) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;

        // Configurar el MediaRecorder para grabar el video
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks.current, { type: "video/webm" });
          setVideoURL(URL.createObjectURL(blob));
          chunks.current = [];
        };

        mediaRecorderRef.current.start();
      } else {
        console.error("No se pudo acceder a la cámara");
      }
      setRecording(true);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef && videoRef) {
      mediaRecorderRef.current.stop();
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();

      tracks.forEach((track) => track.stop());
    }

    setRecording(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <video ref={videoRef} autoPlay muted></video>
        <div>
          {!recording ? (
            <button onClick={startRecording}>
              Comenzar grabación
            </button>
          ) : (
            <button onClick={stopRecording}>Detener grabación</button>
          )}
        </div>
        {videoURL && (
          <div>
            <h3>Video Grabado:</h3>
            <video src={videoURL} controls></video>
            <a href={videoURL} download="video_grabado.webm">
              Descargar video
            </a>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
