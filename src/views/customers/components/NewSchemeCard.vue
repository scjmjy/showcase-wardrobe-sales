<template>
    <div class="new-scheme-card">
        <el-button
            class="new-scheme-card__add"
            type="text"
            icon="el-icon-circle-plus-outline"
            @click="doNew"
        ></el-button>
        <el-button class="new-scheme-card__text" type="text" @click="doNew">创建定制方案</el-button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "NewSchemeCard",
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

    width: 300px;
    height: 334px;

    background: #ffffff;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.08);
    border-radius: 10px;

    &__add {
        font-size: 134px !important;
    }

    &__text {
        margin-top: 40px;
    }
}
</style>
