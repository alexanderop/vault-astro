import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onOfflineReady() {
    console.info("Vault ready to work offline");
  },
});
