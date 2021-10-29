import "babylonjs"; // 会在全局注册 BABYLON
import "babylonjs-loaders"; // 会在全局的 BABYLON 里注册 loaders
import "babylonjs-gui"; // 会在全局的 BABYLON 里注册 gui
import "babylonjs-serializers"; // 会在全局的 BABYLON 里注册 serializers， 如 GLTF2Export

import ElementPlus from "element-plus";
import "skeleton-elements/skeleton-elements.css";

import Vue3Autocounter from "vue3-autocounter";

import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";

import ElCollapseTransitionH from "@/components/ElCollapseTransitionH.vue";
import StateIcon from "@/components/StateIcon.vue";

// for dev
// import "@/assets/scss/dev.scss";

const app = createApp(App);
app.component(ElCollapseTransitionH.name, ElCollapseTransitionH)
    .component(StateIcon.name, StateIcon)
    .component("vue3-autocounter", Vue3Autocounter);

app.use(router).use(store).use(ElementPlus).mount("#app");

export default app;
