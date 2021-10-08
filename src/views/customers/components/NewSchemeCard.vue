<template>
    <div class="new-scheme-card">
        <el-button class="new-scheme-card__add" type="text" icon="el-icon-plus" @click="doNew"></el-button>
        <el-button class="new-scheme-card__text" type="primary" size="small" round @click="doNew">
            创建定制方案
        </el-button>
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
$widthSmall: 240px;
$heightSmall: 276px;
$widthBig: 300px;
$heightBig: 334px;
.new-scheme-card {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    overflow: hidden;

    width: $widthBig;
    height: $heightBig;

    background: #ffffff;
    box-shadow: 2px 5px 10px rgba(0, 0, 0, 0.08);
    border-radius: 10px;

    &__add {
        font-size: 134px !important;
        border-radius: 6px;
        border: 6px solid var(--el-color-primary);
        padding: 0px;
    }

    &__text {
        margin-top: 40px;
    }
}

@media (max-width: 1200px) {
    .new-scheme-card {
        width: $widthSmall;
        height: $heightSmall;
    }
}
</style>
