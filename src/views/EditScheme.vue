<template>
    <div class="EditScheme">
        <br />
        <br />
        <input type="button" class="LogScheme" value="查看Scheme" @click="LogScheme()" />
        &nbsp;
        <input type="button" class="AddDrawer" value="添加抽屉" @click="AddDrawer()" />
        &nbsp;
        <input type="button" class="AddShelf" value="添加隔板" @click="AddShelf()" />
        <Babylon :scheme="scheme" :selectedPartId="selectedPartId" :getAvailableArea="getAvailableArea" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Babylon from "@/components/Babylon/Babylon.vue";
import { Scheme, Area, Position } from "@/lib/scheme";
import * as util from "@/lib/scheme.util";

export default defineComponent({
    name: "EditScheme",
    data() {
        return {
            scheme: {} as Scheme,
            selectedPartId: 0,
        };
    },
    components: {
        Babylon,
    },
    created() {
        // Get scheme.json
        // TODO: change to get scheme from web.
        // this.scheme = util.parseManifest("mf/scheme.json");

        this.scheme = util.importSchemeJson("mf/scheme.json");
    },
    methods: {
        LogScheme() {
            console.log("LogScheme: ", this.scheme);
        },

        AddDrawer() {
            this.selectedPartId = 300005;
        },

        AddShelf() {
            this.selectedPartId = 300001;
        },

        getAvailableArea(partId: number): Area[] {
            // TODO: compute the available areas later.
            const areas = [];
            let area = new Area(
                "4cd170f8-291b-4236-b515-b5d27ac1209d",
                new Position(-350, 1050, -270),
                new Position(350, 1900, 290),
            );
            areas.push(area);

            area = new Area(
                "ce28f905-a6e1-4f68-9998-ed13f950ea91",
                new Position(-350, 350, -270),
                new Position(350, 1900, 290),
            );
            areas.push(area);

            return areas;
        },
    },
});
</script>
