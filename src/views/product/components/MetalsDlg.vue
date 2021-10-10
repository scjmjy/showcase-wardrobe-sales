<template>
    <el-dialog
        class="metals-dlg"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        title="五金"
        width="650px"
        v-bind="$attrs"
        @opened="onOpened"
    >
        <metal-item
            v-if="schemePart"
            v-model="schemePart.count"
            :name="part.name"
            :url="part.pic"
            @change="handleChange"
        />
        <!-- <template #footer>
            <el-button type="primary" @click="doConfirm">确 定</el-button>
        </template> -->
    </el-dialog>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from "vue";
import { PartCount, Scheme } from "@/lib/scheme";
import { Part } from "@/api/interface/provider.interface";
import MetalItem from "./MetalItem.vue";

export default defineComponent({
    name: "MetalsDlg",
    components: {
        MetalItem,
    },
    props: {
        scheme3d: {
            type: Object as PropType<Scheme>,
            default: undefined,
        },
        part: {
            type: Object as PropType<Part>,
            default: undefined,
        },
    },
    emits: ["schemeDirty"],
    setup(props, ctx) {
        const schemePart = ref<PartCount>();
        return {
            schemePart,
            onOpened() {
                if (props.scheme3d && props.part) {
                    const parts = props.scheme3d.getPartCounts();
                    const { id } = props.part;
                    const found = parts.find((p) => p.partId === id);
                    if (found) {
                        schemePart.value = found;
                    } else {
                        const part = new PartCount(+id, 0);
                        parts.push(part);
                        schemePart.value = part;
                    }
                }
            },
            handleChange(val: number) {
                ctx.emit("schemeDirty");
            },
        };
    },
});
</script>

<style scoped></style>
