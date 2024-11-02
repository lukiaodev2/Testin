import logo from "./logo.svg";
import "./App.css";
import React, { useEffect } from "react";
import {
  LocationRequestComponent,
  VideoCameraRequestComponent,
} from "./permissions.tsx";

function App() {
  const { registerForVideoCamera } = VideoCameraRequestComponent();

  const { registerForLocation } = LocationRequestComponent();

  const fetchCameraAndSetupListener = async () => {
    const stream = await registerForVideoCamera();
    if (stream) {
      alert("otorgados");
    }
  };

  const fetchLocation = async () => {
    const loc = await registerForLocation(); // Espera a obtener la ubicación

    if (loc) {
      const { latitude, longitude } = loc;
      alert(`obtenido ${latitude}, ${longitude}`, );
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCameraAndSetupListener();
      fetchLocation();
    })();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
