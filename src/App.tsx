import Webcam from "react-webcam";
import "./App.css";
import React, { useCallback, useEffect, useRef, useState } from "react";

const videoConstraints = {
  width: 1280,
  height: 720,
};

function App() {
  const webcamRef = useRef<any>(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const mediaRecorderRef = useRef<any>(null);

  const [deviceId, setDeviceId] = useState({});
  const [devices, setDevices] = useState([]);

  const handleDevices = useCallback(
    (mediaDevices) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }: any) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      // a.style = "display: none";
      // a.href = url;
      // a.download = "react-webcam-stream-capture.webm";
      // a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          audio={false}
          height={360}
          screenshotFormat="image/jpeg"
          width={720}
          videoConstraints={{
            ...videoConstraints,
            facingMode,
          }}
        />
        <div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-full"
            onClick={() => {
              setFacingMode(facingMode === "user" ? "environment" : "user");
            }}
          >
            Change Camera
          </button>
      
        </div>
        {capturing ? (
          <button
            onClick={handleStopCaptureClick}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full flex"
          >
            Stop Capture
          </button>
        ) : (
          <div>
            <button
              onClick={handleStartCaptureClick}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full flex"
            >
              Start Capture
            </button>
            {imageSrc && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex"
                onClick={() => {
                  setImageSrc(null);
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {recordedChunks.length > 0 && (
          <video
            controls
            style={{
              marginTop: 20,
              width: 720,
              height: 360,
            }}
          >
            <source
              src={URL.createObjectURL(
                new Blob(recordedChunks, { type: "video/webm" })
              )}
              type="video/webm"
            />
          </video>
        )}

        {recordedChunks.length > 0 && (
          <div className="">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex"
              onClick={handleDownload}
            >
              Download
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex"
              onClick={() => {
                setRecordedChunks([]);
              }}
            >
              Clear
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
