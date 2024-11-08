import "./App.css";
import React, { useEffect } from "react";

function App() {
  const [recording, setRecording] = React.useState<boolean>(false);
  const [videoURL, setVideoURL] = React.useState<any>(null);
  const mediaRecorderRef = React.useRef<any>(null);
  const videoRef = React.useRef<any>(null);
  const chunks = React.useRef<any>([]);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<any>(null);
  const [devices, setDevices] = React.useState<any>([]);

  // Enumerar dispositivos de video disponibles
  React.useEffect(() => {
    const getDevices = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      // Seleccionar el primer dispositivo por defecto
      if (videoDevices[0]) setSelectedDeviceId(videoDevices[0].deviceId);
    };
    getDevices();
  }, []);

  const startRecording = async () => {
    // Solicitar permiso y acceso a la cámara
    try {
      if (videoRef && mediaRecorderRef) {
        console.log("media: ", navigator);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
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

  // Iniciar la cámara y el micrófono con el dispositivo seleccionado
  const startCamera = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId || selectedDeviceId },
        audio: true,
      });
      videoRef.current.srcObject = stream;
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: "video/webm" });
        setVideoURL(URL.createObjectURL(blob));
        chunks.current = [];
      };
    } catch (error) {
      console.error("Error accediendo a la cámara o micrófono:", error);
    }
  };

  // Cambiar de cámara
  const handleDeviceChange = (event) => {
    const newDeviceId = event.target.value;
    setSelectedDeviceId(newDeviceId);
    // Detener el video actual antes de iniciar el nuevo
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    startCamera(newDeviceId); // Iniciar la cámara con el nuevo dispositivo
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Grabador de Video</h2>
        <select onChange={handleDeviceChange} value={selectedDeviceId}>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Cámara ${device.deviceId}`}
            </option>
          ))}
        </select>
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
