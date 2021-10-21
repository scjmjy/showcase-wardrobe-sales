<template>
    <div class="attachment-popup">
        <div class="attachment-popup__overlay"></div>
        <div class="attachment-popup__content">
            <!-- <attachment-item :item="item" column /> -->
            <!-- <cat-tab class="attachment-popup__content-cat" :cat="cat" active></cat-tab> -->
            <category-tabs ref="catTabs" @part="onPartClick">
                <template #content-header>
                    <div class="attachment-popup__content-header">
                        <div class="attachment-popup__content-header__action">
                            <el-button type="primary" size="small" :disabled="!selectedPart" @click="changePart"
                                >保存修改</el-button
                            >
                            <el-button
                                type="warning"
                                circle
                                icon="el-icon-arrow-down"
                                size="small"
                                @click="toggleTrigger"
                            ></el-button>
                        </div>
                        <attachment-item :item="item" column />
                        <!-- <i class="attachment-popup__content-trigger el-icon-arrow-down" @click="toggleTrigger"></i> -->
                    </div>
                </template>
            </category-tabs>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref } from "vue";
import { ManifestPart, Part, PartCategory } from "@/api/interface/provider.interface";
import CategoryTabs from "./CategoryTabs.vue";
import AttachmentItem from "./AttachmentItem.vue";

export default defineComponent({
    name: "AttachmentPopup",
    components: {
        CategoryTabs,
        AttachmentItem,
        // CatTab,
    },
    props: {
        item: {
            type: Object as PropType<ManifestPart>,
            required: true,
        },
    },
    setup(props, ctx) {
        const catTabs = ref<InstanceType<typeof CategoryTabs>>();
        const selectedPart = ref<Part>();
        const selectedPartCat = ref<PartCategory>();
        onMounted(() => {
            // TODO catId is unknown
            catTabs.value?.selectPart(15, props.item.partid);
        });
        return {
            selectedPart,
            selectedPartCat,
            catTabs,
            toggleTrigger() {
                ctx.emit("hide");
            },
            onPartClick(part: Part, cat: PartCategory) {
                console.log("[onPartClick]", part, cat);
                selectedPart.value = part;
                selectedPartCat.value = cat;
            },
            changePart() {
                ctx.emit("change", selectedPart.value, selectedPartCat.value);
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
    padding-top: 25%;
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
        // padding: 20px 10%;
        overflow: hidden;

        // display: flex;
        // flex-direction: column;

        &-cat {
            flex: 1;
        }
        &-header {
            // position: relative;
            padding: 10px;
            border-bottom: 1px solid var(--el-color-info);
            &__action {
                display: flex;
                justify-content: space-between;
            }
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
            z-index: 2;
        }
    }
}
</style>
