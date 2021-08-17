import "babylonjs"; // 会在全局注册 BABYLON
import "babylonjs-loaders"; // 会在全局的 BABYLON 里注册 loaders
import "babylonjs-gui"; // 会在全局的 BABYLON 里注册 gui
import "babylonjs-serializers"; // 会在全局的 BABYLON 里注册 serializers， 如 GLTF2Export

import ElementPlus from "element-plus";

import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

import SvgIcon from "@/assets/icons";
import ElCollapseTransitionH from "@/components/ElCollapseTransitionH.vue";
import StateIcon from "@/components/StateIcon.vue";

// for dev
import "@/assets/scss/dev.scss";

const app = createApp(App);
app.component(ElCollapseTransitionH.name, ElCollapseTransitionH);
app.component(StateIcon.name, StateIcon);

app.use(router).use(store).use(ElementPlus).use(SvgIcon).mount("#app");

export default app;
