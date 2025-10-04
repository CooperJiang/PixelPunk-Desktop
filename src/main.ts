import { createApp } from "vue";
import pinia from "./stores";
import router from "./router";
import App from "./App.vue";
import { logger } from "@/utils/logger";
import clickOutside from "./directives/clickOutside";
import "./style.css";

async function initializeApp() {
  // 创建Vue应用
  const app = createApp(App);

  app.use(pinia);
  app.use(router);

  // 注册全局指令
  app.directive("click-outside", clickOutside);

  app.mount("#app");

  await logger.info("[Main] App mounted");
}

initializeApp().catch((error) => {
  logger.error("App initialization failed", { error: String(error) });
});
