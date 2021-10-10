<template>
    <el-dialog
        custom-class="metals-dlg"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        title="添加配件"
        width="50%"
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
        <template #footer>
            <div class="metals-dlg__footer">
                <el-button
                    type="primary"
                    :loading="loading"
                    :disabled="!changed"
                    @click="doConfirm"
                    style="width: 156px"
                    >确认</el-button
                >
            </div>
        </template>
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
    emits: ["change-part"],
    setup(props, ctx) {
        const schemePart = ref<PartCount>();
        const changed = ref(false);
        let isNew = false;
        return {
            schemePart,
            changed,
            onOpened() {
                schemePart.value = undefined;
                if (props.scheme3d && props.part) {
                    const parts = props.scheme3d.composition;
                    const { id } = props.part;
                    const found = parts.find((p) => p.partId === id);
                    if (found) {
                        isNew = false;
                        schemePart.value = new PartCount(found.partId, found.count);
                    } else {
                        isNew = true;
                        const part = new PartCount(+id, 0);
                        schemePart.value = part;
                    }
                }
            },
            handleChange() {
                changed.value = true;
            },
            doConfirm() {
                const parts = props.scheme3d!.composition;
                if (isNew) {
                    parts.push(schemePart.value!);
                } else {
                    const { id } = props.part!;
                    const found = parts.find((p) => p.partId === id);
                    found!.partId = schemePart.value!.partId;
                    found!.count = schemePart.value!.count;
                }
                ctx.emit("change-part");
            },
        };
    },
});
</script>

<style lang="scss">
.metals-dlg {
    min-width: 650px;
}
</style>
