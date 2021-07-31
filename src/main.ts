import "babylonjs"; // 会在全局注册 BABYLON
import "babylonjs-loaders"; // 会在全局的 BABYLON 里注册 loaders
import "babylonjs-gui"; // 会在全局的 BABYLON 里注册 gui
import "babylonjs-serializers"; // 会在全局的 BABYLON 里注册 serializers， 如 GLTF2Export

import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

import ElementPlus from "element-plus";
import "element-plus/lib/theme-chalk/index.css";

const app = createApp(App);
app.use(router).use(store).use(ElementPlus).mount("#app");

export default app;
