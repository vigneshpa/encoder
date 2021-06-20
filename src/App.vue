<template lang="pug">
#app
  .headder
    h1 I Encoder
  .content
    .orginal
      h3 Orginal
      button(@click="selectAndRead") Select file
      br
      video(controls, :src="inpt")
    .options
      label Convert Oprions:
      input(type="text", v-model="convertOptions", style="width: 250px")
      br
      button(@click="convert", :disabled="!converter.readyToConvert") Convert
      br
      progress(max="1", :value="converter.progress")
      | {{ typeof converter.progress == 'number' ? (converter.progress * 100).toFixed(2) + '%' : 'Loading...' }}
      br
    .output
      h3 Output
      video(controls, :src="opt")
      br
      a(:href="opt", download, :disabled="!opt")
        button(:disabled="!opt") Save File
  .footer
    p
      | Using
      |
      a(href="https://ffmpegwasm.github.io/") ffmpegwasm
      |
      | library to convert
</template>

<style lang="scss">
$minWidth: 450px;
$width: 50vmin;
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
      margin: 1vmin auto 1vmin auto;
      background-color: rgb(236, 236, 236);
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
  }
}
</style>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import Converter from "./converter";

export default defineComponent({
  name: "App",
  setup() {
    let converter: Converter;
    try {
      converter = new Converter({
        log: true,
      });
    } catch (e) {
      alert("Cannot load the program\n" + e);
      throw e;
    }

    const convertOptions = ref("-c:v libx264 -preset fast -crf 22 -c:a aac");
    const selectAndRead = () => converter.selectFile();
    const convert = async () => {
      if (!converter.ref.readyToConvert)
        return alert("Cannot convert untill the program is ready !");
      try {
        converter.convert(convertOptions.value);
      } catch (e) {
        alert(e);
        throw e;
      }
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