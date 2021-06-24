<template lang="pug">
.bubbles
  - var n = 50;
  while n > 0
    - n--;
    .bubble
#app
  .headder I Encoder
  .content
    .orginal.contentDiv
      h4 Orginal
      button(@click="selectAndRead") Select file
      br
      transition(name="expand")
        video(controls, :src="inpt", v-if="inpt")
    .options.contentDiv
      h4 Convertion Options
      .optionsGridContainer
        label CLI Arguments:
        input(type="text", v-model="convertOptionsStr")
        label File Format:
        select(v-model="convertOptions.ext", @change="convertOptionsStr = ''")
          option(value=".mp4") MPEG-4 Part 14 (.mp4)
          option(value=".mkv") Matroska Container (.mkv)
          option(value=".mov") QuickTime Format (.mov)
          option(value=".webm") WebM Format (.webm)
          option(value=".ogv") Ogg Video Format (.ogv)
          option(value=".mpeg") MPEG Video Format (.mpeg)
          option(value=".avi") Audio Video Interleave (.avi)
          option(value=".3gp") 3GPP file format (.3gp)
      button(@click="convert", :disabled="!converter.readyToConvert") Convert
      br
      progress(max="1", :value="converter.progress")
      | {{ typeof converter.progress == 'number' ? (converter.progress * 100).toFixed(2) + '%' : 'Loading...' }}
      br
    .output.contentDiv
      h4 Output
      transition(name="expand")
        video(controls, :src="opt", v-if="opt")
      br
      a(:href="opt", :download="optName", :disabled="!opt")
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
$minVidHeight: calc(50vmin - 30px);
.expand-enter-active,
.expand-leave-active {
  transition: opacity 0.5s ease;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}

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
    .contentDiv {
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
        min-height: $minVidHeight;
      }
      .optionsGridContainer {
        display: grid;
        grid-template-columns: auto auto;
        label {
          text-align:right;
        }
      }
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

    const convertOptionsStr = ref("-c:v libx264 -preset fast -crf 22 -c:a aac");
    const convertOptions = ref({ ext: ".mp4" }).value;
    const selectAndRead = () => converter.selectFile();
    const convert = async () => {
      if (!converter.ref.readyToConvert)
        return alert("Cannot convert untill the program is ready !");
      converter
        .convert(convertOptionsStr.value, convertOptions.ext)
        .catch((e) => alert(e));
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
    const optName = computed((ctx) =>
      converter.ref.outputFile ? converter.ref.outputFile.name : ""
    );
    return {
      selectAndRead,
      convert,
      convertOptions,
      convertOptionsStr,
      opt,
      inpt,
      converter: converter.ref,
      optName,
    };
  },
});
</script>