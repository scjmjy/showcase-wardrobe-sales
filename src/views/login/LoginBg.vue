<template>
    <div class="login-bg">
        <div class="login-bg__welcome">—————————————————— Welcome</div>
        <div class="login-bg__left"></div>
        <div class="login-bg__right"></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "LoginBg",
    setup() {
        return {};
    },
});
</script>

<style lang="scss" scoped>
.login-bg {
    position: absolute;
    left: 0px;
    top: 0px;
    right: 0px;
    bottom: 0px;
    display: flex;
    &__welcome {
        position: absolute;
        left: 10px;
        bottom: 0px;
        writing-mode: vertical-rl;
        // text-orientation: mixed;
        transform: rotateZ(180deg);
        color: white;
        font-size: 22px;
    }
    &__left {
        width: 40%;
        height: 100%;
        background-color: #3c3c3c;
    }
    &__right {
        width: 60%;
        height: 100%;
        background-color: white;
    }
}
</style>
