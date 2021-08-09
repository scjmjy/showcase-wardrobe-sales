<template>
    <div class="st-home">
        <h3>Edit Cube Level and Divison</h3>
        <p>From Parent: {{ containerMessage }}</p>

        <button class="test" v-on:click="onAddLevel()">Add Level</button>
        <button class="test" v-on:click="onAddDivision()">Add Division</button>
        <button class="test" v-on:click="onDeletePart()">Delete Part</button>
        <br />
        <button @click="onClickEditSection('L')">L</button>
        <button @click="onClickEditSection('U')">Up</button>
        <button @click="onClickEditSection('D')">Down</button>
        <button @click="onClickEditSection('R')">R</button>
        <br />

        <button class="test" v-on:click="onClickDoor('add-single')">Single Door</button>
        <button class="test" v-on:click="onClickDoor('add-double')">Double Door</button>
        <button class="test" v-on:click="onClickDoor('add-slide')">Side Door</button>
        <button class="test" v-on:click="onClickDoor('display')">Door Visible</button>
        <button class="test" v-on:click="onClickDoor('turn')">Door Turn</button>
        <br />
    </div>
</template>

<script lang="ts">
import { StBabylonRoom } from "@/lib/babylonjs/st_babylon_room";
import Vue from "vue";

export default Vue.extend({
    name: "StEditCube",
    props: {
        callback: {
            type: Function,
        },
        getSketchRoom: {
            type: Function,
        },
        containerMessage: String,
    },
    data: function () {
        return {
            room: {} as StBabylonRoom,
            selected: {
                unitId: "",
                cubeId: "",
                sectionId: "",
            },
        };
    },
    methods: {
        onClickDoor(btn: string) {
            this.room = this.getSketchRoom();
            console.debug("[EditCube] click DOOR: %s", btn);
            this.callback("Door", btn);
        },
        onClickEditSection(btn: string) {
            console.debug("[EditCube] click edit-section: %s", btn);
            this.callback("EditSection", btn);
        },
        updateInfo() {
            const info = this.getSketchRoom();
            this.room = info.room;
            this.selected.unitId = info.unitId;
            this.selected.cubeId = info.cubeId;
            this.selected.sectionId = info.sectionId;
        },

        onAddLevel() {
            this.updateInfo();
            alert("TODO");
            //this.room.wardrobe?.addLevel(this.selected.cubeId, this.room.scene);
        },
        onAddDivision() {
            this.updateInfo();
            alert("TODO");
            //this.room.wardrobe?.addDivision(this.selected.cubeId, this.selected.sectionId, this.room.scene);
        },
        onDeletePart() {
            this.updateInfo();
            alert("TODO");
            //this.room.wardrobe?.deleteSection(this.selected.cubeId, this.selected.sectionId, this.room.scene);
        },
    },
});
</script>

<style scoped>
h3,
p {
    color: wheat;
}
button {
    width: 60px;
    font-size: 14px;
    margin: 10px;
}
button.test {
    width: 100px;
    font-size: 14px;
    margin: 5px;
}
</style>
