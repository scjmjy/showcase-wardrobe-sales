<template>
    <div>
        <el-divider>配件清单</el-divider>
        <manifest-item
            v-for="(item, index) of partList"
            :key="index"
            :url="item.pic"
            :name="item.pname"
            :price="item.price"
            v-model:count="item.count"
            :type="item.type"
            :partId="item.partid"
        ></manifest-item>
        <el-divider style="margin-top: 30px">附件清单</el-divider>
        <attachment-item
            v-for="(item, index) of attachmentList"
            :key="index"
            :url="item.pic"
            :name="item.pname"
            :price="item.price"
            v-model:count="item.count"
            :type="item.type"
            :partId="item.partid"
        ></attachment-item>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";
import { SchemeManifest } from "@/api/interface/provider.interface";
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

<style scoped></style>
