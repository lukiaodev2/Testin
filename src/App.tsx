import "./App.css";
import React, { useEffect } from "react";

function App() {
  const [recording, setRecording] = React.useState<any>(false);
  const [videoBlob, setVideoBlob] = React.useState<any>(null);
  const [videoURL, setVideoURL] = React.useState<any>(null);
  const [devices, setDevices] = React.useState<any>([]);
  const [selectedDeviceId, setSelectedDeviceId] = React.useState<any>(null);
  const videoRef = React.useRef<any>(null);
  const mediaRecorderRef = React.useRef<any>(null);
  const chunksRef = React.useRef<any>([]);
  const [stream, setStream] = React.useState<any>(null);

  // Enumerar dispositivos de video disponibles
  React.useEffect(() => {
    const getDevices = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(
        (device) => device.kind === "videoinput"
      );
      setDevices(videoDevices);
      // Seleccionar el primer dispositivo por defecto
      if (videoDevices[0]) {
        setSelectedDeviceId(videoDevices[0].deviceId);
        startCamera(videoDevices[0].deviceId);
      }
    };
    getDevices();
  }, []);

  // Iniciar la cámara y el micrófono con el dispositivo seleccionado
  const startCamera = async (deviceId) => {
    try {
      const streamTemp = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: deviceId || selectedDeviceId },
        audio: true,
      });
      setStream(streamTemp);
      videoRef.current.srcObject = streamTemp;
    } catch (error) {
      console.error("Error accediendo a la cámara o micrófono:", error);
    }
  };

  const [lastDevice, setLastDevice] = React.useState(false);

  // Cambiar de cámara
  const handleDeviceChange = () => {
    const newDeviceId = lastDevice
      ? devices[devices.length - 1].deviceId
      : devices[0].deviceId;
    setSelectedDeviceId(newDeviceId);
    // Detener el video actual antes de iniciar el nuevo
    if (videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    startCamera(newDeviceId); // Iniciar la cámara con el nuevo dispositivo
    setLastDevice(!lastDevice)
  };

  // Iniciar la grabación
  const startRecording = async () => {
    if (stream) {
      setRecording(true);
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoBlob(blob);
        setVideoURL(URL.createObjectURL(blob));
        chunksRef.current = [];
      };
      mediaRecorderRef.current.start();
    }
  };

  // Detener la grabación
  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current.stop();
  };

  // Descargar el video grabado
  const downloadVideo = () => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "grabacion_con_audio.webm";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };
  return (
    <div className="App">
      <header className="App-header">
        <h1>Grabador de Video con Cambio de Cámara</h1>

        {/* Seleccionar cámara */}

        <button onClick={handleDeviceChange}>Change</button>
        <select onChange={handleDeviceChange} value={selectedDeviceId}>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Cámara ${device.deviceId}`}
            </option>
          ))}
        </select>

        {/* Vista previa de video */}
        <video ref={videoRef} autoPlay playsInline muted></video>

        {/* Botones de grabación */}
        <div>
          {!recording ? (
            <button onClick={startRecording}>Iniciar Grabación</button>
          ) : (
            <button onClick={stopRecording}>Detener Grabación</button>
          )}
        </div>

        {/* Descargar video */}
        {videoBlob && (
          <div>
            <video src={videoURL} controls></video>
            <button onClick={downloadVideo}>Descargar Video</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
