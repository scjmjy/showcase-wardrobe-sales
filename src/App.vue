<template>
    <div class="app-wrapper">
        <div id="nav">
            <router-link to="/">Home</router-link> | <router-link to="/demo-model">Models</router-link> |
            <router-link to="/demo-cube">Cube</router-link> | <router-link to="/demo-storage">Storage</router-link> |
            <router-link to="/demo-accesory">Accesory</router-link> |
            <router-link to="/demo-material">Material</router-link> | <router-link to="/demo-3d">3D </router-link> |
            <router-link to="/demo/geometry2d">Geometry 2D</router-link> |
            <router-link to="/demo/build3d">Build 3d</router-link> |
            <router-link to="/demo/display3d">Model & Mesh </router-link> |
            <router-link to="/demo-demo3">Demo3</router-link> |
        </div>
        <el-config-provider :locale="locale">
            <router-view v-slot="{ Component }">
                <transition mode="out-in" name="el-zoom-in-center">
                    <keep-alive include="SelectProduct,CustomerList">
                        <component :is="Component" />
                    </keep-alive>
                </transition>
            </router-view>
        </el-config-provider>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useStore } from "vuex";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import emitter from "@/event";

export default defineComponent({
    setup() {
        const store = useStore();
        emitter.on("customer-created", (cid) => {
            store.commit("SET-DIRTY-CUSTOMER", true);
        });
        return {
            locale: zhCn,
            // cachedViews: ["SelectProduct"],
        };
    },
});
</script>

<style lang="scss">
@import "./assets/scss/index.scss";
@import "./assets/css/st-component.css";

* {
    user-select: none;
}

html,
body {
    height: 100%;
}

#app {
    font-family: Microsoft YaHei, Avenir, Helvetica, Arial, sans-serif;
    // font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 100%;
}

.app-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-width: 1024px;
    max-width: 1366px;
    min-height: 768px;
    margin: auto;
}

#nav {
    padding: 30px;
    text-align: center;
    position: fixed;
    width: 100%;
    transition: transform 0.3s ease;
    transform: translateY(-60px);
    background: chartreuse;
    &:hover {
        transform: translateY(0);
    }
    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}
</style>
