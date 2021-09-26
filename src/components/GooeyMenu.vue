<template>
    <nav class="menu">
        <input
            ref="refInput"
            type="checkbox"
            href="#"
            class="menu-open"
            name="menu-open"
            id="menu-open"
            :checked="modelValue"
        />
        <label class="menu-open-button" @click="onLabelClick">
            <span class="hamburger hamburger-1"></span>
            <span class="hamburger hamburger-2"></span>
            <span class="hamburger hamburger-3"></span>
        </label>

        <span
            v-for="(item, index) in items"
            :key="index"
            class="menu-item"
            :class="{ 'is-active': item.active, 'is-button': item.type === 'button' }"
            @click="onItemClick(item)"
        >
            <i class="iconfont" :class="'icon-' + item.icon"></i>
        </span>

        <!-- filters -->
        <svg v-show="false" xmlns="http://www.w3.org/2000/svg" version="1.1">
            <defs>
                <filter id="shadowed-goo">
                    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                        result="goo"
                    />
                    <feGaussianBlur in="goo" stdDeviation="3" result="shadow" />
                    <feColorMatrix
                        in="shadow"
                        mode="matrix"
                        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 -0.2"
                        result="shadow"
                    />
                    <feOffset in="shadow" dx="1" dy="1" result="shadow" />
                    <feComposite in2="shadow" in="goo" result="goo" />
                    <feComposite in2="goo" in="SourceGraphic" result="mix" />
                </filter>
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation="10" />
                    <feColorMatrix
                        in="blur"
                        mode="matrix"
                        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                        result="goo"
                    />
                    <feComposite in2="goo" in="SourceGraphic" result="mix" />
                </filter>
            </defs>
        </svg>
    </nav>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from "vue";
import { MenuItem } from "./GooeyMenu.helper";

export default defineComponent({
    name: "GooeyMenu",
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        items: {
            type: Array as PropType<MenuItem[]>,
            default: () => [],
        },
    },
    emits: ["update:modelValue", "click"],
    setup(props, ctx) {
        const refInput = ref<HTMLInputElement>();
        return {
            refInput,
            onItemClick(item: MenuItem) {
                item.active = !item.active;
                ctx.emit("click", item);
                ctx.emit("update:modelValue", false);
                if (item.type === "button") {
                    item.onClick && item.onClick();
                } else if (item.active) {
                    item.onActive && item.onActive();
                } else {
                    item.onUnactive && item.onUnactive();
                }
            },
            onLabelClick() {
                ctx.emit("update:modelValue", !props.modelValue);
            },
        };
    },
});
</script>

<style scoped lang="scss">
@use "sass:math";

//vars
$fg: var(--el-color-primary);
$pi: 3.14;

//config
$menu-items: 4;
$open-distance: 105px;
$opening-angle: $pi * 2;

a {
    color: inherit;
}
%goo {
    filter: url("#shadowed-goo");
    // debug
    //background:rgba(255,0,0,0.2);
}
$ballSize: 56px;
%ball {
    background: $fg;
    border-radius: 100%;
    width: $ballSize;
    height: $ballSize;
    // margin-left: -40px;
    position: absolute;
    // top: 20px;
    color: white;
    text-align: center;
    line-height: $ballSize;
    transform: translate3d(0, 0, 0);
    transition: transform ease-out 200ms;
}
.menu-open {
    display: none;
}
.menu-item {
    @extend %ball;

    & i {
        color: inherit;
    }
}
.hamburger {
    $width: 25px;
    $height: 3px;
    width: $width;
    height: $height;
    background: white;
    display: block;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-left: math.div(-$width, 2);
    margin-top: math.div(-$height, 2);
    transition: transform 200ms;
}
$hamburger-spacing: 8px;
.hamburger-1 {
    transform: translate3d(0, -$hamburger-spacing, 0);
}
.hamburger-2 {
    transform: translate3d(0, 0, 0);
}
.hamburger-3 {
    transform: translate3d(0, $hamburger-spacing, 0);
}
.menu-open:checked + .menu-open-button {
    .hamburger-1 {
        transform: translate3d(0, 0, 0) rotate(45deg);
    }
    .hamburger-2 {
        transform: translate3d(0, 0, 0) scale(0.1, 1);
    }
    .hamburger-3 {
        transform: translate3d(0, 0, 0) rotate(-45deg);
    }
}
.menu {
    @extend %goo;
    // width: ;
    height: $ballSize;
    box-sizing: border-box;
    font-size: 20px;
    text-align: left;
}

.menu-item {
    cursor: pointer;
    font-size: 28px;
    background-color: var(--el-color-primary-light-5);
    &:hover {
        background-color: white;
        color: $fg;
    }
    @for $i from 1 through $menu-items {
        &:nth-child(#{$i + 2}) {
            transition-duration: 180ms;
        }
    }
    &.is-active {
        background-color: var(--el-color-primary);
        &:hover {
            background-color: white;
            color: $fg;
        }
    }
    &.is-button {
        background-color: var(--el-color-primary);
        &:hover {
            background-color: white;
            color: $fg;
        }
    }
}

.menu-open-button {
    @extend %ball;
    z-index: 2;
    transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transition-duration: 400ms;
    transform: scale(1.1, 1.1) translate3d(0, 0, 0);
    cursor: pointer;
}
.menu-open-button:hover {
    transform: scale(1.2, 1.2) translate3d(0, 0, 0);
}
.menu-open:checked + .menu-open-button {
    transition-timing-function: linear;
    transition-duration: 200ms;
    transform: scale(0.8, 0.8) translate3d(0, 0, 0);
}

.menu-open:checked ~ .menu-item {
    transition-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
    @for $i from 1 through $menu-items {
        &:nth-child(#{$i + 2}) {
            transition-duration: 90ms+ (100ms * $i);
            transform: translate3d(80px * $i, 0, 0);
        }
    }
}
</style>
