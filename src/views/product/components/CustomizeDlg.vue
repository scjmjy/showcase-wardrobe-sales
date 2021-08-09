<template>
    <el-dialog v-bind="$attrs">
        <el-form ref="elForm" :model="formData" label-width="140px" label-position="left">
            <el-form-item label="单元柜高度" prop="height">
                <el-input v-model="formData.height"></el-input>
            </el-form-item>
            <el-form-item label="单元柜深度" prop="depth">
                <el-input v-model="formData.depth"></el-input>
            </el-form-item>
            <el-form-item label="单元柜宽度" prop="width">
                <el-input v-model="formData.width"></el-input>
            </el-form-item>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="doCancel">取 消</el-button>
                <el-button type="primary" @click="doConfirm">确 定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
    emits: ["confirm", "cancel"],
    setup(props, ctx) {
        const formData = reactive({
            height: 4,
            depth: 1,
            width: 4,
        });
        return {
            formData,
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
