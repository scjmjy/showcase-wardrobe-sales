<template>
    <div class="state-icon" :class="{ disabled: disabled }">
        <i class="state-icon__icon iconfont" :class="iconClass" :style="iconStyle" @click="onIconClick"></i>
        <span v-if="label__" class="state-icon__label" :style="labelStyle">{{ label__ }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

export interface State {
    state: string;
    icon?: string;
    iconBg?: string;
    iconColor?: string;
    label?: string;
    labelColor?: string;
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
            type: Array as PropType<State[]>,
            default: () => [
                { state: "" },
                {
                    state: "active",
                    iconBg: "black",
                    iconColor: "#D8D8D8",
                },
            ],
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
        disabled: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "change"],
    setup(props, ctx) {
        const currentState = computed(() => props.states.find((s) => s.state === props.modelValue));
        const iconClass = computed(() => {
            const state = currentState.value || ({} as State);
            return "icon-" + (state.icon || props.icon);
        });
        const iconStyle = computed(() => {
            const state = currentState.value || ({} as State);
            return {
                "background-color": state.iconBg || props.iconBg,
                color: state.iconColor || props.iconColor,
            };
        });
        const labelStyle = computed(() => {
            const state = currentState.value || ({} as State);
            return {
                color: state.labelColor || props.labelColor,
            };
        });
        const label__ = computed(() => {
            const state = currentState.value || ({} as State);
            return state.label || props.label;
        });
        return {
            iconClass,
            iconStyle,
            labelStyle,
            label__,
            onIconClick() {
                if (props.disabled) {
                    return;
                }
                let nextState: State | undefined = undefined;
                const currentIndex = props.states.findIndex((s) => s.state === props.modelValue);
                if (currentIndex === -1) {
                    nextState = props.states[0];
                } else {
                    const nextIndex = currentIndex + 1;
                    nextState = nextIndex === props.states.length ? props.states[0] : props.states[nextIndex];
                }
                const nextValue = (nextState || { state: "" }).state;
                ctx.emit("update:modelValue", nextValue);
                ctx.emit("change", nextValue, props.modelValue);
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
        cursor: pointer;
        width: 64px;
        height: 64px;
        font-size: 40px;
        border-radius: 50%;
        transition: transform 0.3s ease;

        &:hover {
            border: 2px solid var(--el-color-primary);
        }
        &:active {
            border: 2px solid var(--el-color-primary);
            transform: scale(0.95);
        }
    }
    &__label {
        margin-top: 10px;
        font-size: 18px;
    }

    &.disabled &__icon {
        opacity: 0.35;
        cursor: not-allowed;
        &:active {
            transform: none;
        }
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
