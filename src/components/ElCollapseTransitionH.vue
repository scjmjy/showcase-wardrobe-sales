/* eslint-disable */
<template>
    <transition v-on="on">
        <slot></slot>
    </transition>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { addClass, removeClass } from "@/utils/dom";

export default defineComponent({
    name: "ElCollapseTransitionH",
    setup() {
        return {
            on: {
                beforeEnter(el: HTMLElement) {
                    addClass(el, "horizontal-collapse-transition");
                    // if (!el.dataset) el.dataset = {};

                    el.dataset.oldPaddingLeft = el.style.paddingLeft;
                    el.dataset.oldPaddingRight = el.style.paddingRight;

                    el.style.width = "0";
                    el.style.paddingLeft = "0";
                    el.style.paddingRight = "0";
                },

                enter(el: HTMLElement) {
                    el.dataset.oldOverflow = el.style.overflow;
                    if (el.scrollWidth !== 0) {
                        el.style.width = el.scrollWidth + "px";
                        el.style.paddingLeft = el.dataset.oldPaddingLeft || "";
                        el.style.paddingRight = el.dataset.oldPaddingRight || "";
                    } else {
                        el.style.width = "";
                        el.style.paddingLeft = el.dataset.oldPaddingLeft || "";
                        el.style.paddingRight = el.dataset.oldPaddingRight || "";
                    }

                    el.style.overflow = "hidden";
                },

                afterEnter(el: HTMLElement) {
                    // for safari: remove class then reset width is necessary
                    removeClass(el, "horizontal-collapse-transition");
                    el.style.width = "";
                    el.style.overflow = el.dataset.oldOverflow || "";
                },

                beforeLeave(el: HTMLElement) {
                    // if (!el.dataset) el.dataset = {};
                    el.dataset.oldPaddingLeft = el.style.paddingLeft;
                    el.dataset.oldPaddingRight = el.style.paddingRight;
                    el.dataset.oldOverflow = el.style.overflow;

                    el.style.width = el.scrollWidth + "px";
                    el.style.overflow = "hidden";
                },

                leave(el: HTMLElement) {
                    if (el.scrollWidth !== 0) {
                        // for safari: add class after set width, or it will jump to zero width suddenly, weired
                        addClass(el, "horizontal-collapse-transition");
                        // fix #968 collapse animation failure.
                        // in vue3.0.4, transitionProperty is set 'none' to avoid 'v-leave-from' issue
                        el.style.transitionProperty = "width";
                        el.style.width = "0";
                        el.style.paddingLeft = "0";
                        el.style.paddingRight = "0";
                    }
                },

                afterLeave(el: HTMLElement) {
                    removeClass(el, "horizontal-collapse-transition");
                    el.style.width = "";
                    el.style.overflow = el.dataset.oldOverflow || "";
                    el.style.paddingLeft = el.dataset.oldPaddingLeft || "";
                    el.style.paddingRight = el.dataset.oldPaddingRight || "";
                },
            },
        };
    },
});
</script>
