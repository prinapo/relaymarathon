import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { Platform } from "quasar";

export default async () => {
  if (!Platform.is.capacitor) {
    return;
  }

  if (Platform.is.android) {
    try {
      await EdgeToEdge.enable();
    } catch (error) {
      console.warn("EdgeToEdge plugin non disponibile o in errore", error);
    }
  }
};
