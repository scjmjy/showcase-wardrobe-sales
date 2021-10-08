<template>
    <div class="new-scheme-card">
        <vue-fixed-ratio :width="1" :height="1" style="width: 100%">
            <el-button class="new-scheme-card__add" type="text" icon="el-icon-plus" @click="doNew"></el-button>
        </vue-fixed-ratio>
        <el-button class="new-scheme-card__text" type="primary" size="small" round @click="doNew">
            创建定制方案
        </el-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VueFixedRatio from "@/components/vue-fixed-ratio.vue";

export default defineComponent({
    name: "NewSchemeCard",
    components: {
        VueFixedRatio,
    },
    props: {
        cover: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            default: "",
        },
    },
    emits: ["new"],
    setup(props, context) {
        return {
            doNew() {
                context.emit("new");
            },
        };
    },
});
</script>

<style scoped lang="scss">
.new-scheme-card {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    min-width: 150px;
    min-height: 150px;

    background: #ffffff;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.08);
    border-radius: 10px;

    &__add {
        font-size: 5rem !important;
        border-radius: 6px;
        border: 6px solid var(--el-color-primary);
        padding: 0px;
        margin-top: 30%;
    }

    &__text {
        margin: 20px 0px;
        padding: 5px 10px !important;
    }
}
</style>
