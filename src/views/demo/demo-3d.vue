<template>
    <div class="st-tank">
        <div class="st-head">
            <aside>Geometry Test: Point, Line, Edge, Polygon (Lib: {{ libVersion }}) ...</aside>
            <textarea v-model="topInfo"> </textarea>
        </div>

        <div class="st-body">
            <div class="main">
                <button class="camera" v-on:click="onCameraFront()">视角: 正面</button>
            </div>
            <div class="sidebar">
                <label>Edge Intersection:</label>
                <button class="test" v-on:click="onTestEdge('intersect01')">Cross </button>
                <button class="test" v-on:click="onTestEdge('intersect02')">NONE </button>
                <button class="test" v-on:click="onTestEdge('intersect03')">On One Edge</button>
                <br />
                <!--
                <button class="test" v-on:click="onTestPolygon('TODO...')">Board: Left-Right</button>
                -->
            </div>
        </div>

        <div class="st-body">
            <div class="main" id="st-workarea">
                <canvas id="renderCanvas" touch-action="none"></canvas>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import StSketchConstant from "@/lib/utility/st_sketch_constant";
import { St3DEngine, sketchEngine } from "@/lib/utility/st_sketch_engine";
import { StSketchCacheTest } from "@/lib/data/st_sketch_cache_test";
import { StISketchRoom } from "@/lib/utility/st_sketch_room_interface";
import { edgeTest } from "@/test/geometry/st_geometric_2d_test";

export default defineComponent({
    name: "st_geometry_2d",
    components: {},
    props: {
        msg: {
            type: String,
        },
    },
    data() {
        return {
            libVersion: StSketchConstant.VERSION,
            //sketchEngine: {} as any,
            room: {} as StISketchRoom,

            topInfo: "",
            useGizmo: true,
            selected: {
                unitId: "",
                cubeId: "",
                sectionId: "",
            },
        };
    },

    created: function () {
        console.log(`component ${this.$options.name} is created ...`);
    },

    unmounted: function () {
        console.log(`component ${this.$options.name} is destroyed ...`);
    },

    mounted: function () {
        console.log(`component ${this.$options.name} is mounted ...`);
        const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        sketchEngine.initialize(St3DEngine.BABYLON_JS, canvas, this.callbackCameraUpdatePos, this.useGizmo);
        this.room = sketchEngine.getRoom();
        //this.onCameraFront();
    },

    methods: {
        callbackCameraUpdatePos(pos: BABYLON.Vector3, target: BABYLON.Vector3, rotate: BABYLON.Vector3) {
            this.topInfo =
                "Camera Pos [" +
                pos.x +
                "," +
                pos.y +
                "," +
                pos.z +
                "], " +
                "Target [" +
                target.x +
                "," +
                target.y +
                "," +
                target.z +
                "]" +
                "Rotate[" +
                rotate.x +
                "," +
                rotate.y +
                "," +
                rotate.z +
                "]";
        },

        onCameraFront() {
            alert("TODO");
        },

        onTestEdge(type: string) {
            try{
                switch (type) {
                    case "intersect01":
                        this.topInfo = edgeTest.intersect01();
                        break;
                    case "intersect02":
                        this.topInfo = edgeTest.intersect02();
                        break;
                    case "intersect03":
                        this.topInfo = edgeTest.intersect03();
                        break;

                    default:
                        alert(`unknowty mesh ${type}`);
                        break;
                }
            }catch(e) {
                this.topInfo = (e as Error).message;
            }
        },

        onTestPolygon(opt: string) {
            /*
            const test = cubeTest;
            switch (opt) {
                case "_TODO":
                    test.create_01();
                    break;
                default:
                    alert("unknown operation: " + opt);
                    break;
            }
            */
        },

        async onCacheInfo() {
            const test = new StSketchCacheTest();
            this.topInfo = await test.showCacheInfo();
        },
    },
});
</script>

<style scoped>
canvas {
    width: 100%;
    height: 100%;
}

button {
    margin: 4px;
}

.camera {
    margin-left: 10px;
    margin-right: 20px;
    font-size: 24px;
    font-style: italic;
}
.st-head textarea {
    margin: 0px;
    width: 1260px;
    height: 90px;
    background-color: darkgrey;
    font-size: 10px;
}
</style>
