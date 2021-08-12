<template>
    <div class="state-icon">
        <i class="state-icon__icon iconfont" :class="iconClass" :style="iconStyle" @click="onIconClick"></i>
        <span v-if="label__" class="state-icon__label" :style="labelStyle">{{ label__ }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

export interface State {
    [state: string]: { icon: string; iconBg?: string; iconColor?: string; label: string; labelColor?: string };
}

export default defineComponent({
    name: "StateIcon",
    props: {
        modelValue: {
            type: [String, Number],
            default: "",
        },
        icon: {
            type: String,
            default: "",
        },
        label: {
            type: String,
            default: "",
        },
        states: {
            type: Object as PropType<State>,
            default: () => ({
                active: { iconBg: "black", iconColor: "#D8D8D8" },
            }),
        },
        iconBg: {
            type: String,
            default: "#D8D8D8",
        },
        iconColor: {
            type: String,
            default: "black",
        },
        labelColor: {
            type: String,
            default: "#999999",
        },
    },
    emits: ["update:modelValue", "click"],
    setup(props, ctx) {
        const iconClass = computed(() => {
            const currentState = props.states[props.modelValue] || {};
            return "icon-" + (currentState.icon || props.icon);
        });
        const iconStyle = computed(() => {
            const currentState = props.states[props.modelValue] || {};
            return {
                "background-color": currentState.iconBg || props.iconBg,
                color: currentState.labelColor || props.labelColor,
            };
        });
        const labelStyle = computed(() => {
            const currentState = props.states[props.modelValue] || {};
            return {
                color: currentState.iconColor || props.iconColor,
            };
        });
        const label__ = computed(() => {
            const currentState = props.states[props.modelValue] || {};
            return currentState.label || props.label;
        });
        return {
            iconClass,
            iconStyle,
            label__,
            onIconClick() {
                ctx.emit("click", props.modelValue);
                // if (props.manual) {
                // } else {
                //     ctx.emit("update:modelValue", props.modelValue === "active" ? "" : "active");
                // }
            },
        };
    },
});
</script>

<style scoped lang="scss">
.state-icon {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    &__icon {
        box-sizing: border-box;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 64px;
        height: 64px;
        font-size: 40px;
        border-radius: 50%;
        transition: transform 0.3s ease;

        &:hover {
            border: 2px solid red;
        }
        &:active {
            border: 2px solid red;
            transform: scale(0.95);
        }
    }
    &__label {
        margin-top: 10px;
        font-size: 18px;
    }
}
</style>

<style lang="scss">
.state-icon-group-h {
    .state-icon:not(:first-of-type) {
        margin-left: 20px;
    }
}
.state-icon-group-v {
    .state-icon:not(:first-of-type) {
        display: flex;
        margin-top: 20px;
    }
}
</style>
