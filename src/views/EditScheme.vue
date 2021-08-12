<template>
    <div class="EditScheme">
        <input type="button" class="onTest" value="测试功能" @click="onTest()" />
        <Babylon :scheme="this.scheme" />
    </div>
</template>

<script>
import Babylon from "@/components/Babylon/Babylon.vue";

export default {
    name: "EditScheme",
    components: {
        Babylon,
    },
    created() {
        // Get scheme.json
        // TODO: why cannot require from public folder?
        // this.scheme = require("/mf/scheme.json");
        this.scheme = require("@/assets/mf/scheme.json");
    },
    methods: {
        onTest() {
            console.log("onTest: ", this.scheme);
        },
    },
};
</script>
