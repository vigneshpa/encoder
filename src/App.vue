<template lang="pug">
#app
  h1 I Encoder
  button(@click="selectAndRead") Select file
  br
  | Orginal :
  video(controls, :src="inpt")
  br
  label Convert Oprions:
  input(type="text", v-model="convertOptions" style="width:250px;")
  br
  button(@click="convert", :disabled="!inpt || !inited || running") Convert
  br
  progress(max="1", :value="pgr")
  | {{ (pgr * 100).toFixed(2) }}%
  br
  | Output :
  video(controls, :src="opt")
  p
    | Using
    |
    a(href="https://ffmpegwasm.github.io/") ffmpegwasm
    |
    | library to convert
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import read from "./reader";

export default defineComponent({
  name: "App",
  setup() {
    const ffmpeg = createFFmpeg({
      log: true,
      corePath: "./ffmpeg/ffmpeg-core.js",
    });

    const fil = ref(<File>(<unknown>null));
    const inpt = ref("");
    const pgr = ref(0);
    const opt = ref("");
    const inited = ref(false);
    const running = ref(false);
    const convertOptions = ref("-c:v libx264 -preset fast -crf 22 -c:a aac");
    const init = async () => {
      try {
        await ffmpeg.load();
      } catch (e) {
        alert("Cannot initilise\n" + e);
        return;
      }
      inited.value = true;
      ffmpeg.setProgress(function ({ ratio }) {
        pgr.value = ratio;
      });
    };
    const selectAndRead = async () => {
      const file = await read();
      console.log(file);
      fil.value = file;
      inpt.value = URL.createObjectURL(file);
    };
    const convert = async () => {
      if (!inited.value)
        return alert("Cannot convert untill the program is initilisied");
      running.value = true;
      try {
        ffmpeg.FS(
          "writeFile",
          fil.value.name,
          new Uint8Array(await fil.value.arrayBuffer())
        );
        await ffmpeg.run(
          "-i",
          fil.value.name,
          ...convertOptions.value.split(/[ ,]+/),
          "output.mp4"
        );
        opt.value = URL.createObjectURL(
          new Blob([ffmpeg.FS("readFile", "output.mp4")], { type: "video/mp4" })
        );
        ffmpeg.FS("unlink", "output.mp4");
        ffmpeg.FS("unlink", fil.value.name);
      } catch (e) {
        alert(e);
      }
      running.value = false;
    };
    init();
    return {
      selectAndRead,
      convert,
      convertOptions,
      inited,
      fil,
      opt,
      inpt,
      pgr,
      running,
    };
  },
});
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
