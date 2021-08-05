<template>
  <div class="st-tank">
    
    <div class="st-head">
      <aside>
        DESCRIPTION: Feature Test  (Lib: {{libVersion}}) ... 
      </aside>
        <textarea v-model="topInfo">
        </textarea>
     </div>
      
    <div class='st-body'>
      <div class='main'>
      <button class="camera"  v-on:click="onCameraFront()">视角: 正面</button>
      </div>
      <div class="sidebar">
        <br/>
        <button class="test"  v-on:click="onCacheInfo()">Cache Info</button>
        <button class="test"  v-on:click="onTest()">Test</button>
      </div>
    </div>

     <div class='st-body'>
      <div class='main' id='st-workarea'> 
        <canvas id="renderCanvas" touch-action="none"></canvas>
      </div>
    </div>
 </div>
</template>

<script lang='ts'>
import Vue from 'vue';
import StSketchConstant from '@/lib/wardrobe/st_sketch_constant';
import {St3DEngine, sketchEngine} from  '@/lib/wardrobe/st_sketch_engine';
import { StSketchCacheTest } from '@/lib/data/st_sketch_cache_test';

export default Vue.extend({
  name: 'StFeatureTest',
  components: {
  },
  props: {
    msg: {
      type: String,
    },
  }, 
  data: function() {
    return {
      libVersion: StSketchConstant.VERSION,
      room: {} as any,
      showDoor: true,
      openDoor: 0,
      topInfo: this.msg, 
      height: 2000,
      cnt: 1,
      useGizmo: true,
      selected: {
         unitId: '',
         cubeId: '',
         sectionId: '',
      },
    }
  },

  created: function() {
    console.log(`component ${this.$options.name} is created ...`);
  },

  destroyed: function() {
    console.log(`component ${this.$options.name} is destroyed ...`);
  },

  mounted: function() {
    console.log(`component ${this.$options.name} is mounted ...`);
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    sketchEngine.initialize(St3DEngine.BABYLON_JS, canvas, this.callbackCameraUpdatePos, this.useGizmo);
    this.room = sketchEngine.getRoom();
    //this.onCameraFront();
  },
 
  methods:{
   callbackCameraUpdatePos(pos: BABYLON.Vector3, target: BABYLON.Vector3, rotate: BABYLON.Vector3)  {
        this.topInfo = 'Camera Pos [' + pos.x + ','  + pos.y + ',' + pos.z + '], ' + 
                  'Target [' + target.x + ',' + target.y + ',' + target.z + ']' + 
                  'Rotate[' + rotate.x + ',' + rotate.y + ',' + rotate.z + ']';
    },

    callbackClickCubeMesh(cube_id: string, sec_id: string){
      this.topInfo = "Clicked: [Cube] " + cube_id + "\n\t [Section] " +  sec_id;
      this.selected.cubeId = cube_id;
      this.selected.sectionId = sec_id;
    }, 

    onCameraFront(){
      alert("TODO");
      //this.room.moveCameraToMainUnit();
    },
    onTest(){
      alert("TODO: ...");
    },

    async onCacheInfo(){
        const test = new StSketchCacheTest();
        this.topInfo = await test.showCacheInfo();
    },
  }
})
</script>

<style scoped>
  canvas {
    width:  100%;
    height: 100%;
  }

  button {
    margin: 4px;
  }

  .camera{
    margin-left: 10px;
    margin-right: 20px;
    font-size: 24px;
    font-style: italic;
  }
  .st-head textarea {
    margin: 0px;
    width:  1260px;
    height: 90px;
    background-color: darkgrey;
    font-size: 10px;
  }

</style>