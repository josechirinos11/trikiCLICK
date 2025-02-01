import * as Location from 'expo-location';
import { auth, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function startTrackingLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    console.error('Permiso de ubicación denegado');
    return;
  }

  Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000, // Actualiza cada 5 segundos
      distanceInterval: 10, // Actualiza cada 10 metros
    },
    async (location) => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'locations', user.uid);
      await setDoc(userRef, {
        uid: user.uid, // 🔹 Guardar el UID dentro del documento
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        activo: true, // 🔹 Agregar estado activo
        timestamp: new Date(),
      }, { merge: true }); // 🔹 merge: true evita sobreescribir otros campos

      console.log(`📌 Ubicación actualizada para ${user.uid}`);
    }
  );
}
