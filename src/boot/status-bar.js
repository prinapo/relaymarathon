import { StatusBar } from "@capacitor/status-bar";
import { Platform } from "quasar";

export default async () => {
  if (!Platform.is.capacitor) {
    return;
  }

  try {
    if (Platform.is.android) {
      // Per Android moderno, accettiamo edge-to-edge e usiamo CSS safe areas
    } else {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setBackgroundColor({ color: "#173A79" });
      } catch (legacyError) {
        console.warn("⚠️ Impostazioni StatusBar legacy fallite:", legacyError);
      }
    }

    await StatusBar.getInfo();
  } catch (error) {
    console.warn("StatusBar plugin non disponibile o in errore", error);
  }
};
