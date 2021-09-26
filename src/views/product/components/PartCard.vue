<template>
    <div ref="refEl" class="part-card" :class="{ active: active }">
        <el-image class="part-card__img u-clickable" :src="part.pic" fit="contain" @click="onImgClick"></el-image>
        <div class="part-card__label">{{ part.name }}</div>
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
                ctx.emit("click", props.part);
            },
        };
    },
});
</script>

<style scoped lang="scss">
.part-card {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    vertical-align: top;
    margin: 10px;
    &__img {
        width: 70px;
        height: 70px;
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
    }

    &.active &__img {
        border: 3px solid var(--el-color-primary);
    }
}
@media (min-width: 1150px) {
    .part-card {
        &__img {
            width: 100px;
            height: 100px;
        }
    }
}

@media (min-width: 1366px) {
    .part-card {
        &__img {
            width: 140px;
            height: 140px;
        }
    }
}
</style>
