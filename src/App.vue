<template lang="pug">
.bubbles
  - var n = 50;
  while n > 0
    - n--;
    .bubble
#app
  .headder I Encoder
  .content
    .orginal
      h4 Orginal
      button(@click="selectAndRead") Select file
      br
      video(controls, :src="inpt")
    .options
      h4 Convertion Options
      input(type="text", v-model="convertOptions", style="width: 250px")
      br
      button(@click="convert", :disabled="!converter.readyToConvert") Convert
      br
      progress(max="1", :value="converter.progress")
      | {{ typeof converter.progress == 'number' ? (converter.progress * 100).toFixed(2) + '%' : 'Loading...' }}
      br
    .output
      h4 Output
      video(controls, :src="opt")
      br
      a(:href="opt", download, :disabled="!opt")
        button(:disabled="!opt") Save File
  .footer
    p
      | Built with
      |
      a(href="https://ffmpegwasm.github.io/", target="__blank") ffmpeg.wasm
</template>

<style lang="scss">
@import "@/assets/bubbles.scss";
$minWidth: calc(100vmin - 60px);
$width: calc(60vmin + 100px);
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  .content {
    display: flex;
    flex-direction: column;
    div {
      transition: all ease 0.3s;
      margin: 1vmin auto 1vmin auto;
      background-color: rgba(236, 236, 236, 0.856);
      width: $width;
      min-width: $minWidth;
      padding: 20px;
      border-radius: 2vmin;
      box-shadow: grey 0px 0px 0.7vmin;
      video {
        width: $width;
        min-width: $minWidth;
      }
      overflow: hidden;
    }
    button {
      padding: 10px;
      margin: 10px;
      border-radius: 5px;
      border: grey solid 1px;
      background-color: white;
    }
  }
  .headder {
    font-size: 3em;
    color: white;
  }
  .footer {
    color: white;
    a {
      color: rgb(122, 122, 255);
    }
  }
}
</style>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Converter from "./converter";

export default defineComponent({
  name: "App",
  setup() {
    const converter = new Converter({
      log: false,
    });

    const convertOptions = ref("-c:v libx264 -preset fast -crf 22 -c:a aac");
    const selectAndRead = () => converter.selectFile();
    const convert = async () => {
      if (!converter.ref.readyToConvert)
        return alert("Cannot convert untill the program is ready !");
      converter.convert(convertOptions.value).catch((e) => alert(e));
    };

    const inpt = computed((ctx) =>
      converter.ref.selectedFile
        ? URL.createObjectURL(converter.ref.selectedFile)
        : ""
    );
    const opt = computed((ctx) =>
      converter.ref.outputFile
        ? URL.createObjectURL(converter.ref.outputFile)
        : ""
    );
    return {
      selectAndRead,
      convert,
      convertOptions,
      opt,
      inpt,
      converter: converter.ref,
    };
  },
});
</script>