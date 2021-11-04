<template>
    <div ref="refEl" class="part-card" :class="{ active: active }">
        <el-image class="part-card__img u-clickable" :src="part.pic" fit="contain" @click="onImgClick"></el-image>
        <div class="part-card__label u-line-1">{{ part.name }}</div>
    </div>
</template>

<script lang="ts">
import { Part } from "@/api/interface/provider.interface";
import { computed, defineComponent, inject, onMounted, PropType, ref, Ref, watch } from "vue";

export default defineComponent({
    name: "PartCard",
    props: {
        part: {
            type: Object as PropType<Part>,
            default: () => ({}),
        },
        // active: {
        //     type: Boolean,
        //     default: false,
        // },
    },
    emits: ["click"],
    setup(props, ctx) {
        const refEl = ref<HTMLDivElement>();
        const selectedPartId = inject<Ref<number>>("selectedPartId", ref(0));
        // const selectedPart = inject<Ref<Part>>("selectedPart", ref<Part>());
        const active = computed(() => props.part.id == selectedPartId.value);
        onMounted(() => {
            watch(
                () => active.value,
                (isActive) => {
                    if (isActive) {
                        console.log("【scrollIntoView】");
                        const target = refEl.value as HTMLDivElement;
                        if (target.parentElement) {
                            target.parentElement.scrollTop = target.offsetTop - target.parentElement.offsetTop;
                        }
                        // refEl.value?.scrollIntoView({ behavior: "smooth" });
                    }
                },
                {
                    immediate: true,
                },
            );
        });
        return {
            refEl,
            selectedPartId,
            active,
            onImgClick() {
                selectedPartId.value = +props.part.id;
                // selectedPart.value = props.part;
                ctx.emit("click", props.part);
            },
        };
    },
});
</script>

<style scoped lang="scss">
@use "sass:math";
$margin: 3%;
$width: math.div(100% - $margin * 4, 2);
.part-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: top;
    margin: $margin;
    width: $width;
    &__img {
        width: 100%;
        height: 100%;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.16);
        border-radius: 10px;
        overflow: hidden;
        background-color: white;
    }
    &__label {
        margin-top: 10px;
        text-align: center;
        font-size: 14px;
        color: var(--el-color-black);
        width: 100%;
    }

    &.active &__img {
        border: 3px solid var(--el-color-danger);
    }
}
</style>
