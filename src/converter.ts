import { createFFmpeg, CreateFFmpegOptions, FFmpeg } from "@ffmpeg/ffmpeg";
import { ref, Ref } from "vue";

const selector = document.createElement("input");
selector.type = "file";
selector.accept = "video/*";

export default class Converter {
    constructor(options: CreateFFmpegOptions) {
        options.corePath = "./ffmpeg/ffmpeg-core.js";
        this.ffmpeg = createFFmpeg(options);
        this.ref = {
            selectedFile: ref(<File><unknown>null),
            outputFile: ref(<Blob><unknown>null),
            progress: ref(0),
            readyToConvert: ref(false),
        };
        this.ffmpeg.load();
        this.ffmpeg.setProgress(pgr => this.ref.progress.value = pgr.ratio);
        this.ref.readyToConvert.value = true;
    }
    ffmpeg: FFmpeg;
    ref: {
        selectedFile: Ref<File>;
        outputFile: Ref<Blob>;
        progress: Ref<number>;
        readyToConvert: Ref<boolean>;
    };
    selectFile(): Promise<File> {
        return new Promise(resolve => {
            selector.onchange = () => {
                this.ref.selectedFile.value = selector.files![0];
                resolve(selector.files![0]);
            }
            selector.click();
        });
    }
    async convert(convertOptions:String) {
        const inptFile = this.ref.selectedFile.value;
        this.ffmpeg.FS(
            "writeFile",
            inptFile.name,
            new Uint8Array(await inptFile.arrayBuffer())
        );
        await this.ffmpeg.run(
            "-i",
            inptFile.name,
            ...convertOptions.split(/[ ]+/),
            "output.mp4"
        );
        this.ref.outputFile.value = new Blob([this.ffmpeg.FS("readFile", "output.mp4")], { type: "video/mp4" });
        this.ffmpeg.FS("unlink", "output.mp4");
        this.ffmpeg.FS("unlink", inptFile.name);
    }
}