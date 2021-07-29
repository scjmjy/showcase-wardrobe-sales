<template>
    <div id="nav">
        <router-link to="/">Home</router-link> | <router-link to="/demo-model">Models</router-link> |
        <router-link to="/demo-cube">Cube</router-link> | <router-link to="/demo-storage">Storage</router-link> |
        <router-link to="/demo-accesory">Accesory</router-link> |
        <router-link to="/demo-material">Material</router-link> | <router-link to="/demo-3d">3D </router-link> |
        <router-link to="/demo/build3d">Build 3d</router-link>  | <router-link to="/demo/display3d">Model & Mesh </router-link> |
        <router-link to="/demo-demo3">Demo3</router-link>
    </div>
    <router-view />
</template>

<style lang="scss">
@import './assets/css/st-component.css';
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
}

#nav {
    padding: 30px;

    a {
        font-weight: bold;
        color: #2c3e50;

        &.router-link-exact-active {
            color: #42b983;
        }
    }
}
</style>
