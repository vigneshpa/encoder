<template lang="pug">
#app
  h1 I Encoder
  button(@click="selectAndRead") Select file
  br
  | Orginal :
  video(controls, :src="inpt")
  br
  label Convert Oprions:
  input(type="text", v-model="convertOptions", style="width: 250px")
  br
  button(@click="convert", :disabled="!converter.readyToConvert") Convert
  br
  progress(max="1", :value="converter.pgr")
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
      if (!converter.ref.readyToConvert.value)
        return alert("Cannot convert untill the program is ready !");
      try {
        converter.convert(convertOptions.value);
      } catch (e) {
        alert(e);
        throw e;
      }
    };

    const inpt = computed((ctx) =>
      URL.createObjectURL(converter.ref.selectedFile)
    );
    const opt = computed((ctx) =>
      URL.createObjectURL(converter.ref.outputFile)
    );
    return {
      selectAndRead,
      convert,
      convertOptions,
      opt,
      inpt,
      converter:converter.ref
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
