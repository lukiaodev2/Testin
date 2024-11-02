
type RequestPermissionsResult = MediaStream | null;

// Solicita permisos de ubicación
export const LocationRequestComponent = () => {
  // Ajuste el ancho del modal según el tamaño de pantalla

  const registerForLocation = async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    if (!navigator.geolocation) {
      alert("Geolocalización no está soportada por este navegador.");
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude, longitude });
        },
        (error) => {
          // Muestra el modal si no hay permiso de geolocalización
          alert("No se puede acceder a la geolocalización del navegador.");
          resolve(null);
        }
      );
    });
  };

  return { registerForLocation };
};

// Solicita permisos de cámara y micrófono
export const VideoCameraRequestComponent = () => {
  const registerForVideoCamera =
    async (): Promise<RequestPermissionsResult> => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        const mediaRescorder = new MediaRecorder(stream);
        mediaRescorder.start();
        // // Detiene el flujo para liberar los recursos temporalmente
        stream.getTracks().forEach((track) => track.stop());

        // Retorna el flujo si se concedieron los permisos
        return stream;
      } catch (err) {
        // Muestra el modal si se deniegan los permisos
        alert("No se pueden acceder a los permisos de cámara y micrófono.");

        return null;
      }
    };

  return { registerForVideoCamera };
};
