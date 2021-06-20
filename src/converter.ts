import { createFFmpeg, CreateFFmpegOptions, FFmpeg } from "@ffmpeg/ffmpeg";
import { ref, Ref } from "vue";

const selector = document.createElement("input");
selector.type = "file";
selector.accept = "video/*";

export default class Converter {
    private inited: boolean = false;
    constructor(options: CreateFFmpegOptions) {
        options.corePath = "./ffmpeg/ffmpeg-core.js";
        this.ffmpeg = createFFmpeg(options);
        this.ref = ref({
            selectedFile: <File><unknown>null,
            outputFile: <Blob><unknown>null,
            progress: <number><unknown>null,
            readyToConvert: ref(false),
        }).value;
        this.ffmpeg.load().then(() => {
            this.inited = true;
            this.ref.progress = 0;
            this.ffmpeg.setProgress(pgr => this.ref.progress = pgr.ratio);
            if(this.ref.selectedFile)this.ref.readyToConvert = true;
        });
    }
    ffmpeg: FFmpeg;
    ref: {
        selectedFile: File;
        outputFile: Blob;
        progress: number;
        readyToConvert: boolean;
    };
    selectFile(): Promise<File> {
        return new Promise(resolve => {
            selector.onchange = () => {
                this.ref.selectedFile = selector.files![0];
                if(this.inited)this.ref.readyToConvert = true;
                resolve(selector.files![0]);
            }
            selector.click();
        });
    }
    async convert(convertOptions: String) {
        const inptFile = this.ref.selectedFile;
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
        this.ref.outputFile = new Blob([this.ffmpeg.FS("readFile", "output.mp4")], { type: "video/mp4" });
        this.ffmpeg.FS("unlink", "output.mp4");
        this.ffmpeg.FS("unlink", inptFile.name);
    }
}