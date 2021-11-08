<template>
    <div class="manifest-list">
        <div class="manifest-list__wrap" :class="{ 'is-blur': selectedAttachmentItem || showDicountPage }">
            <el-divider>板材清单</el-divider>
            <div class="manifest-list__parts">
                <manifest-item v-for="(item, index) of boardList" :key="index" :item="item"></manifest-item>
            </div>
            <el-divider>配件清单</el-divider>
            <div class="manifest-list__parts">
                <manifest-item v-for="(item, index) of partList" :key="index" :item="item"></manifest-item>
            </div>
            <el-divider v-if="attachmentList.length" style="margin-top: 30px">附件清单</el-divider>
            <attachment-item
                v-for="(item, index) of attachmentList"
                :key="index"
                :item="item"
                :selectedItem="selectedAttachmentItem"
                @select="onAttachmentItemSelect"
            ></attachment-item>
        </div>
        <el-button
            class="manifest-list__discount"
            type="text"
            icon="el-iconfont icon-discount"
            @click="onDiscountBtnClick"
        ></el-button>

        <transition name="el-zoom-in-bottom">
            <attachment-popup
                v-if="selectedAttachmentItem"
                :item="selectedAttachmentItem"
                @change="onAttachmentChange"
                @hide="onAttachmentPopupHide"
            ></attachment-popup>
        </transition>
        <transition name="el-zoom-in-bottom">
            <discount-popup v-if="showDicountPage" :schemeId="$attrs.schemeId" @hide="onDiscountPopupHide" />
        </transition>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { ManifestPart, Part, PartCategory, SchemeManifest } from "@/api/interface/provider.interface";
import ManifestItem from "./ManifestItem.vue";
import AttachmentItem from "./AttachmentItem.vue";
import AttachmentPopup from "./AttachmentPopup.vue";
import DiscountPopup from "./DiscountPopup.vue";

export default defineComponent({
    name: "ManifestList",
    components: {
        ManifestItem,
        AttachmentItem,
        AttachmentPopup,
        DiscountPopup,
    },
    props: {
        list: {
            type: Array as PropType<SchemeManifest>,
            default: () => [],
        },
    },
    setup(props, ctx) {
        const selectedAttachmentItem = ref<ManifestPart>();

        const showDicountPage = ref(false);
        const boardList = computed(() => {
            return props.list.filter((item) => item.type === "board");
        });
        const partList = computed(() => {
            return props.list.filter((item) => item.type === "part");
        });
        const attachmentList = computed(() => {
            return props.list.filter((item) => item.type === "attachment");
        });
        return {
            selectedAttachmentItem,
            showDicountPage,
            boardList,
            partList,
            attachmentList,
            onDiscountBtnClick() {
                showDicountPage.value = true;
            },
            onAttachmentItemSelect(item: ManifestPart) {
                selectedAttachmentItem.value = item;
            },
            onAttachmentChange(part: Part, _cat: PartCategory) {
                if (selectedAttachmentItem.value) {
                    const oldAttachment = Object.assign({}, selectedAttachmentItem.value);
                    const newAttachment = Object.assign({}, oldAttachment, {
                        pname: part.name,
                        pic: part.pic,
                        partid: +part.id,
                    });
                    ctx.emit("attachment-replacement", newAttachment, oldAttachment);

                    Object.assign(selectedAttachmentItem.value, newAttachment);

                    selectedAttachmentItem.value = undefined;
                }
            },
            onAttachmentPopupHide() {
                selectedAttachmentItem.value = undefined;
            },
            onDiscountPopupHide() {
                showDicountPage.value = false;
            },
        };
    },
});
</script>

<style scoped lang="scss">
// @use "~@/assets/scss/business.scss" as *;

.manifest-list {
    position: relative;
    height: 100%;
    padding: 0px 10px;
    overflow: hidden;

    &__wrap {
        overflow-y: auto;
        height: calc(100% - 70px);
        padding: 0 20px;
        &.is-blur {
            filter: blur(2px);
        }
    }

    &__parts {
        background-color: var(--el-color-info);
        border-radius: 6px;
        padding: 10px;
    }
    &__discount {
        position: absolute;
        bottom: 10px;
        right: 10px;
        font-size: 30px;
    }
}
</style>
