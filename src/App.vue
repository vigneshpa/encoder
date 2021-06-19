<template lang="pug">
#app
  h1 Hello World !
  button(@click="selectAndRead") Select file
  br
  | Orginal :
  video(controls, :src="inpt")
  br
  button(@click="convert") Convert
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
import read from "./read";

export default defineComponent({
  name: "App",
  setup() {
    const ffmpeg = createFFmpeg({
      log: true,
      corePath: "./ffmpeg/ffmpeg-core.js",
    });

    const fil = ref(<File>(<unknown>null));
    let uint: Uint8Array;
    const inpt = ref("");
    const pgr = ref(0);
    const opt = ref("");
    const inited = ref(false);
    const init = async () => {
      await ffmpeg.load();
      inited.value = true;
      ffmpeg.setProgress(function ({ ratio }) {
        pgr.value = ratio;
      });
    };
    const selectAndRead = async () => {
      const [file, data] = await read();
      console.log(file);
      fil.value = file;
      uint = new Uint8Array(data);
      inpt.value = URL.createObjectURL(
        new Blob([uint], { type: fil.value.type })
      );
    };
    const convert = async () => {
      if (!inited.value)
        return alert("Cannot convert untill the program is initilisied");
      ffmpeg.FS("writeFile", fil.value.name, uint);
      await ffmpeg.run(
        "-i",
        fil.value.name,
        "-c:v",
        "libx264",
        "-preset",
        "fast",
        "-crf",
        "22",
        "-c:a",
        "copy",
        "output.mp4"
      );
      opt.value = URL.createObjectURL(
        new Blob([ffmpeg.FS("readFile", "output.mp4")], { type: "video/mp4" })
      );
    };
    init();
    return { selectAndRead, convert, fil, opt, inpt, pgr };
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
