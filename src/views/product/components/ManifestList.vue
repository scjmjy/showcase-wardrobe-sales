<template>
    <div class="manifest-list">
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
            v-bind="$attrs"
        ></attachment-item>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { ManifestPart, SchemeManifest } from "@/api/interface/provider.interface";
import ManifestItem from "./ManifestItem.vue";
import AttachmentItem from "./AttachmentItem.vue";
import { useStore } from "vuex";
import { StateType } from "@/store";

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
        const store = useStore<StateType>();
        const boardList = computed(() => {
            return props.list.filter((item) => {
                return store.state.globalCfg?.partsCatBoard.includes(item.catid);
            });
        });
        const partList = computed(() => {
            return props.list.filter(
                (item) => item.type === "3d" && !store.state.globalCfg?.partsCatBoard.includes(item.catid),
            );
        });
        const attachmentList = computed(() => {
            return props.list.filter((item) => item.type === "2d");
        });
        return {
            boardList,
            partList,
            attachmentList,
        };
    },
});
</script>

<style scoped lang="scss">
.manifest-list {
    position: relative;

    &__parts {
        background-color: var(--el-color-info);
        border-radius: 6px;
        padding: 10px;
    }
}
</style>
