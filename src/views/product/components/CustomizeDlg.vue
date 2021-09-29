<template>
    <el-dialog
        class="customize-dlg"
        :title="title"
        center
        width="500px"
        @opened="onOpened"
        @closed="onClosed"
        v-bind="$attrs"
    >
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
            <div class="customize-dlg__unit">单位：米</div>
        </el-form>
        <template #footer>
            <el-button @click="doCancel">不修改</el-button>
            <el-button type="primary" :loading="loading" @click="doConfirm">{{ okText }}</el-button>
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from "vue";
import { CustomizeMode, CustomizeSize, CustomizeMinMax } from "../helpers";

function defaultSize(): CustomizeSize {
    return {
        height: 2.4,
        depth: 0.6,
        width: 1.2,
    };
}
function defaultMinMax(): CustomizeMinMax {
    return {
        depthMax: 1.0,
        // depthMin: p.pdepthmin,
        depthMin: 0.6,
        widthMax: 6.0,
        // widthMin: p.pwidthmin,
        widthMin: 1.0,
        heightMax: 2.8,
        // heightMin: p.pheightmin,
        heightMin: 2.4,
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
        size: {
            type: Object as PropType<CustomizeSize>,
            default: defaultSize(),
        },
        minMax: {
            type: Object as PropType<CustomizeMinMax>,
            default: defaultMinMax(),
        },
    },
    setup(props, ctx) {
        const formData = reactive(defaultSize());
        return {
            formData,
            formRules: computed(() => ({
                height: [
                    { required: true, message: "请输入单元柜高度", trigger: ["blur", "change"] },
                    {
                        type: "number",
                        min: 240,
                        max: 280,
                        message: `高度在 ${props.minMax.heightMin}米 到 ${props.minMax.heightMax}米 之间`,
                        trigger: ["blur", "change"],
                    },
                ],
                depth: [
                    { required: true, message: "请输入单元柜深度", trigger: ["blur", "change"] },
                    {
                        type: "number",
                        min: 30,
                        max: 60,
                        message: `深度在 ${props.minMax.depthMin}米 到 ${props.minMax.depthMax}米 之间`,
                        trigger: ["blur", "change"],
                    },
                ],
                width: [
                    { required: true, message: "请输入单元柜宽度", trigger: ["blur", "change"] },
                    {
                        type: "number",
                        min: 50,
                        max: 600,
                        message: `宽度在 ${props.minMax.widthMin}米 到 ${props.minMax.widthMax}米 之间`,
                        trigger: ["blur", "change"],
                    },
                ],
            })),
            title: computed(() => {
                return "修改柜体尺寸";
                // switch (props.mode) {
                //     case "copy":
                //         return "复制方案";
                //     case "new":
                //     default:
                //         return "新方案定制";
                // }
            }),
            okText: computed(() => {
                return "确认修改";
                // switch (props.mode) {
                //     case "new":
                //         return "确认创建";
                //     case "copy":
                //         return "确认复制";
                //     // case "continue":
                //     //     return "确认创建";
                //     default:
                //         return "确认";
                // }
            }),
            doCancel() {
                ctx.emit("cancel", false);
            },
            doConfirm() {
                ctx.emit("confirm", formData);
            },
            onOpened() {
                Object.assign(formData, props.size);
            },
            onClosed() {
                // Object.assign(formData, defaultSize());
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
