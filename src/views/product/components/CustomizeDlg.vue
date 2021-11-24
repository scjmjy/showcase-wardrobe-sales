<template>
    <el-dialog
        custom-class="customize-dlg"
        :title="title"
        width="500px"
        @opened="onOpened"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        v-bind="$attrs"
    >
        <el-form
            ref="elForm"
            :model="formData"
            :rules="formRules"
            label-width="140px"
            label-position="left"
            hide-required-asterisk
            @validate="onValidate"
        >
            <div class="customize-dlg__unit">单位：m</div>
            <el-form-item label="高度" prop="height">
                <el-input v-model.number="formData.height" type="number" step="0.01"></el-input>
            </el-form-item>
            <el-form-item label="深度" prop="depth">
                <el-input v-model.number="formData.depth" type="number" step="0.01"></el-input>
            </el-form-item>
            <el-form-item label="宽度" prop="width">
                <el-input v-model.number="formData.width" type="number" step="0.01"></el-input>
            </el-form-item>
            <div v-if="unitPrice" class="customize-dlg__price" :class="{ 'is-discount': hasDiscount }">
                <span class="customize-dlg__price-label"> 总价： </span>
                <vue3-autocounter
                    ref="counter"
                    class="customize-dlg__price-value"
                    :startAmount="lastValue"
                    :endAmount="totalPrice"
                    :duration="1.5"
                    :decimals="2"
                    separator=","
                    @finished="onFinished"
                />
                <span class="customize-dlg__price-unit" :data-discount="`(${discount ? discount.label : ''})`">
                    元</span
                >
            </div>
        </el-form>
        <template #footer>
            <el-button class="el-dialog__footer-btn-cancel" @click="doCancel">取消</el-button>
            <el-button
                class="el-dialog__footer-btn-ok"
                type="primary"
                :loading="loading"
                :disabled="invalid"
                @click="doConfirm"
                >{{ okText }}</el-button
            >
        </template>
    </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive, ref } from "vue";
import { ElForm, ElMessage } from "element-plus";
import { useStore } from "vuex";
import { CustomizeMode, CustomizeMinMax, useDiscount } from "../helpers";
import { Size3D } from "@/api/interface/common.interface";
import { StateType } from "@/store";
import { NoDiscountItem } from "@/api/interface/provider.interface";

function defaultSize(): Size3D {
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
            type: Object as PropType<Size3D>,
            default: defaultSize(),
        },
        minMax: {
            type: Object as PropType<CustomizeMinMax>,
            default: defaultMinMax(),
        },
        unitPrice: {
            type: Number,
            default: undefined,
        },
        discountId: {
            type: Number,
            default: 1, // TODO: backend sql column id 1 for no discount
        },
    },
    setup(props, ctx) {
        const elForm = ref<InstanceType<typeof ElForm>>();
        const formData = reactive(defaultSize());
        const formRules = computed(() => ({
            height: [
                { required: true, message: "请输入单元柜高度", trigger: ["blur", "change"] },
                {
                    type: "number",
                    min: props.minMax.heightMin,
                    max: props.minMax.heightMax,
                    message: `高度在 ${props.minMax.heightMin}米 到 ${props.minMax.heightMax}米 之间`,
                    trigger: ["blur", "change"],
                },
            ],
            depth: [
                { required: true, message: "请输入单元柜深度", trigger: ["blur", "change"] },
                {
                    type: "number",
                    min: props.minMax.depthMin,
                    max: props.minMax.depthMax,
                    message: `深度在 ${props.minMax.depthMin}米 到 ${props.minMax.depthMax}米 之间`,
                    trigger: ["blur", "change"],
                },
            ],
            width: [
                { required: true, message: "请输入单元柜宽度", trigger: ["blur", "change"] },
                {
                    type: "number",
                    min: props.minMax.widthMin,
                    max: props.minMax.widthMax,
                    message: `宽度在 ${props.minMax.widthMin}米 到 ${props.minMax.widthMax}米 之间`,
                    trigger: ["blur", "change"],
                },
            ],
        }));
        const invalidProps = ref<Record<string, boolean>>({});
        const invalid = computed(() => {
            return Object.values(invalidProps.value).includes(true);
        });
        const { hasDiscount, discount } = useDiscount(props);
        const lastValue = ref(0);
        const totalPrice = computed(() => {
            const { unitPrice } = props;
            if (unitPrice) {
                const d = discount.value?.discount || 1;
                return formData.depth * formData.width * unitPrice * d;
            }
            return undefined;
        });
        return {
            elForm,
            formData,
            formRules,
            invalid,
            totalPrice,
            lastValue,
            hasDiscount,
            discount,
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
                return "确认";
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
            onFinished() {
                lastValue.value = totalPrice.value || 0;
            },
            doCancel() {
                ctx.emit("cancel", false);
            },
            doConfirm() {
                elForm.value?.validate((isValid) => {
                    if (isValid) {
                        ctx.emit("confirm", formData);
                    } else {
                        ElMessage.warning("表单校验失败！");
                    }
                });
            },
            onOpened() {
                Object.assign(formData, props.size);
            },
            onValidate(propName: string, pass: boolean) {
                invalidProps.value[propName] = !pass;
            },
        };
    },
});
</script>

<style lang="scss">
.customize-dlg {
    &__unit,
    &__price {
        color: var(--el-color-black);
        font-size: 22px;
        text-align: right;
        &-value {
            color: var(--el-color-danger);
            font-weight: bold;
        }
    }

    &__price.is-discount {
        .customize-dlg__price-unit {
            &[data-discount] {
                padding-right: 35px;
                position: relative;
                &::after {
                    position: absolute;
                    content: attr(data-discount);
                    bottom: 0px;
                    color: var(--el-color-primary);
                    font-size: 0.8em;
                    white-space: nowrap;
                }
            }
        }
    }

    .el-dialog__body {
        padding-left: 40px;
        padding-right: 40px;
        padding-bottom: 20px;
    }
}
</style>
