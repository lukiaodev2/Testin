import logo from "./logo.svg";
import "./App.css";
import React, { useEffect } from "react";
import { VideoCameraRequestComponent } from "./permissions.tsx";

function App() {
  const { registerForVideoCamera } = VideoCameraRequestComponent();

  const fetchCameraAndSetupListener = async () => {
    const stream = await registerForVideoCamera();
    if (stream) {
      alert("otorgados");
    }
  };

  useEffect(() => {
    fetchCameraAndSetupListener()
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
