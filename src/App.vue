<template>
    <div class="app-wrapper">
        <div id="nav">
            <router-link to="/">Home</router-link> | <router-link to="/demo-model">Models</router-link> |
            <router-link to="/demo-cube">Cube</router-link> | <router-link to="/demo-storage">Storage</router-link> |
            <router-link to="/demo-accesory">Accesory</router-link> |
            <router-link to="/demo-material">Material</router-link> | <router-link to="/demo-3d">3D </router-link> |
            <router-link to="/demo/build3d">Build 3d</router-link> |
            <router-link to="/demo/display3d">Model & Mesh </router-link> |
            <router-link to="/demo-demo3">Demo3</router-link> |
            <router-link to="/editscheme">Edit Scheme</router-link>
        </div>
        <router-view />
    </div>
</template>

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
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    height: 100%;
}

.app-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
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
