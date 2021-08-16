<template>
    <el-dialog :close-on-click-modal="false" :close-on-press-escape="false" v-bind="$attrs">
        <template #title>
            <span> 合计数量 </span>
            <span> 33 </span>
        </template>
        TODO 五金
        <template #footer>
            <el-button type="primary" @click="doConfirm">确 定</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
    name: "MetalsDlg",
    emits: ["confirm", "cancel"],
    setup(props, ctx) {
        return {
            doCancel() {
                ctx.emit("cancel", false);
            },
            doConfirm() {
                ctx.emit("confirm", false);
            },
        };
    },
});
</script>

<style scoped></style>
