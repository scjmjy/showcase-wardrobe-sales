<template>
    <el-dialog class="customize-dlg" :title="title" center width="500px" @closed="onClosed" v-bind="$attrs">
        <el-form ref="elForm" :model="formData" :rules="formRules" label-width="140px" label-position="left">
            <el-form-item label="单元柜高度" prop="height">
                <el-input v-model.number="formData.height"></el-input>
            </el-form-item>
            <el-form-item label="单元柜深度" prop="depth">
                <el-input v-model.number="formData.depth"></el-input>
            </el-form-item>
            <el-form-item label="单元柜宽度" prop="width">
                <el-input v-model.number="formData.width"></el-input>
            </el-form-item>
            <div class="customize-dlg__unit">单位：cm</div>
        </el-form>
        <template #footer>
            <el-button @click="doCancel">放 弃</el-button>
            <el-button type="primary" :loading="loading" @click="doConfirm">{{ okText }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from "vue";
import { CustomizeMode } from "../helpers";

function defaultSize() {
    return {
        height: 240,
        depth: 50,
        width: 50,
    };
}

export default defineComponent({
    name: "CustomizeDlg",
    emits: ["confirm", "cancel"],
    props: {
        mode: {
            type: String as PropType<CustomizeMode>,
            default: "scheme-new",
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, ctx) {
        const formData = reactive(defaultSize());
        return {
            formData,
            formRules: {
                height: [
                    { required: true, message: "请输入单元柜高度", trigger: ["blur", "change"] },
                    {
                        type: "number",
                        min: 240,
                        max: 280,
                        message: "高度在 240cm 到 280cm 之间",
                        trigger: ["blur", "change"],
                    },
                ],
                depth: [
                    { required: true, message: "请输入单元柜深度", trigger: ["blur", "change"] },
                    {
                        type: "number",
                        min: 30,
                        max: 50,
                        message: "深度在 30cm 到 50cm 之间",
                        trigger: ["blur", "change"],
                    },
                ],
                width: [
                    { required: true, message: "请输入单元柜宽度", trigger: ["blur", "change"] },
                    {
                        type: "number",
                        min: 50,
                        max: 600,
                        message: "宽度在 50cm 到 600cm 之间",
                        trigger: ["blur", "change"],
                    },
                ],
            },
            title: computed(() => {
                switch (props.mode) {
                    case "copy":
                        return "复制方案";
                    case "new":
                    default:
                        return "新方案定制";
                }
            }),
            okText: computed(() => {
                switch (props.mode) {
                    case "new":
                        return "确认创建";
                    case "copy":
                        return "确认复制";
                    // case "continue":
                    //     return "确认创建";
                    default:
                        return "确认";
                }
            }),
            doCancel() {
                ctx.emit("cancel", false);
            },
            doConfirm() {
                ctx.emit("confirm", formData);
            },
            onClosed() {
                Object.assign(formData, defaultSize());
            },
        };
    },
});
</script>

<style lang="scss" scoped>
.customize-dlg {
    &__unit {
        color: var(--el-color-info);
        font-size: 18px;
        text-align: right;
    }

    :deep(.el-dialog__body) {
        padding-left: 40px;
        padding-right: 40px;
    }
}
</style>
