<template>
    <div class="manifest-list">
        <el-divider>配件清单</el-divider>
        <manifest-item v-for="(item, index) of partList" :key="index" :item="item"></manifest-item>
        <el-divider style="margin-top: 30px">附件清单</el-divider>
        <attachment-item
            v-for="(item, index) of attachmentList"
            :key="index"
            :item="item"
            v-bind="$attrs"
        ></attachment-item>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { ManifestPart, SchemeManifest } from "@/api/interface/provider.interface";
import ManifestItem from "./ManifestItem.vue";
import AttachmentItem from "./AttachmentItem.vue";

export default defineComponent({
    name: "ManifestList",
    components: {
        ManifestItem,
        AttachmentItem,
    },
    props: {
        list: {
            type: Array as PropType<SchemeManifest>,
            default: () => [],
        },
    },
    setup(props) {
        const partList = computed(() => {
            return props.list.filter((item) => item.type === "3d");
        });
        const attachmentList = computed(() => {
            return props.list.filter((item) => item.type === "2d");
        });
        return {
            partList,
            attachmentList,
        };
    },
});
</script>

<style scoped lang="scss">
.manifest-list {
    position: relative;
}
</style>
