<template>
    <div class="st-tank">
        <div class="st-head">
            <aside>Test: Model, Mesh class (Lib: {{ libVersion }}) ...</aside>
            <textarea v-model="topInfo"> </textarea>
        </div>

        <div class="st-body">
            <div class="main">
                <button class="camera" v-on:click="onCameraFront()">视角: 正面</button>
            </div>
            <div class="sidebar">
                <button class="test" v-on:click="onCacheInfo()">Cache Info</button>
                <button class="test" v-on:click="onTestMesh('pillar')">Pillar</button>
                <button class="test" v-on:click="onTestCube('create')">Cube: C</button>
                <button class="test" v-on:click="onTestCube('W+')">W+</button>
                <button class="test" v-on:click="onTestCube('W-')">W-</button>
                <button class="test" v-on:click="onTestCube('H+')">H+</button>
                <button class="test" v-on:click="onTestCube('H-')">H-</button>
                <button class="test" v-on:click="onTestCube('D+')">D+</button>
                <button class="test" v-on:click="onTestCube('D-')">D-</button>
                <button class="test" v-on:click="onTestCube('GB+')">GB+</button>
                <button class="test" v-on:click="onTestCube('GB-')">GB-</button>
                <br />
                <button class="test" v-on:click="onTestMesh('board-3')">Board: Left-Right</button>
                <button class="test" v-on:click="onTestMesh('board-1')">B-Position</button>
                <button class="test" v-on:click="onTestMesh('board-2')">B-Rotate</button>
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
import { StMeshObjectTest } from "@/test/wardrobe/st_mesh_object_test";
import { cubeTest } from "@/test/wardrobe/st_model_object_test";
import { StISketchRoom } from "@/lib/utility/st_sketch_room_interface";

export default defineComponent({
    name: "StDisplay3D",
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

            showDoor: true,
            openDoor: 0,
            topInfo: "",
            height: 2000,
            cnt: 1,
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

        callbackClickCubeMesh(cube_id: string, sec_id: string) {
            this.topInfo = "Clicked: [Cube] " + cube_id + "\n\t [Section] " + sec_id;
            this.selected.cubeId = cube_id;
            this.selected.sectionId = sec_id;
        },

        onCameraFront() {
            alert("TODO");
            //this.room.moveCameraToMainUnit();
        },

        onTestMesh(type: string) {
            const pillar_test = new StMeshObjectTest();
            switch (type) {
                case "pillar":
                    pillar_test.createPillar_01();
                    break;
                case "board-1":
                    pillar_test.createBoard_01();
                    break;
                case "board-2":
                    pillar_test.createBoard_02();
                    break;
                case "board-3":
                    pillar_test.createBoard_03();
                    break;
                default:
                    alert(`unknowty mesh ${type}`);
                    break;
            }
        },

        onTestCube(opt: string) {
            const test = cubeTest;
            switch (opt) {
                case "create":
                    test.create_01();
                    break;
                case "H+":
                    test.changeHeight(true);
                    break;
                case "H-":
                    test.changeHeight(false);
                    break;
                case "W+":
                    test.changeWidth(true);
                    break;
                case "W-":
                    test.changeWidth(false);
                    break;
                case "D+":
                    test.changeDepth(true);
                    break;
                case "D-":
                    test.changeDepth(false);
                    break;
                case "GB+":
                    test.changeBottomGap(true);
                    break;
                case "GB-":
                    test.changeBottomGap(false);
                    break;
                default:
                    alert("unknown operation: " + opt);
                    break;
            }
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
