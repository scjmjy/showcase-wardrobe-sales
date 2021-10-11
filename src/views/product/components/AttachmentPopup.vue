<template>
    <div class="attachment-popup">
        <div class="attachment-popup__overlay"></div>
        <div class="attachment-popup__content">
            <attachment-item :item="item" column />
            <cat-tab class="attachment-popup__content-cat" :cat="cat" active></cat-tab>
            <el-button type="primary">保存修改</el-button>
            <i class="attachment-popup__content-trigger el-icon-arrow-down" @click="toggleTrigger"></i>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { ManifestPart, PartCategory } from "@/api/interface/provider.interface";
import CatTab from "./CatTab.vue";
import AttachmentItem from "./AttachmentItem.vue";

export default defineComponent({
    name: "AttachmentPopup",
    components: {
        CatTab,
        AttachmentItem,
    },
    props: {
        item: {
            type: Object as PropType<ManifestPart>,
            required: true,
        },
    },
    setup(props, ctx) {
        const cat = computed<PartCategory>(() => ({
            id: props.item.partid,
            name: props.item.pname,
            pic: props.item.pic,
        }));
        return {
            cat,
            toggleTrigger() {
                ctx.emit("hide");
            },
        };
    },
});
</script>

<style scoped lang="scss">
.attachment-popup {
    z-index: 1000;
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    padding-top: 40%;
    &__overlay {
        z-index: -1;
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
    }
    &__content {
        z-index: 2;
        position: relative;
        width: 100%;
        height: 100%;
        background-color: white;
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        padding: 20px 10%;

        display: flex;
        flex-direction: column;

        &-cat {
            flex: 1;
        }

        &-trigger {
            cursor: pointer;
            position: absolute;
            top: 30px;
            right: 43px;
            padding: 5px;
            border-radius: 50%;
            background-color: #00000059;
            color: white;
            font-size: 30px;
        }
    }
}
</style>
