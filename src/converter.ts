import { createFFmpeg, CreateFFmpegOptions, FFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { computed, ref } from "vue";

const selector = document.createElement("input");
selector.type = "file";
selector.accept = "video/*";

export default class Converter {
    private prvRef: {
        inited: boolean;
        running: boolean;
    } = ref({
        inited: false,
        running: false,
    }).value;
    constructor(options: CreateFFmpegOptions) {
        options.corePath = "./ffmpeg/ffmpeg-core.js";
        this.ffmpeg = createFFmpeg(options);
        this.ref = ref({
            selectedFile: <File><unknown>null,
            outputFile: <File><unknown>null,
            progress: <number><unknown>null,
            readyToConvert: computed(ctx => (this.prvRef.inited && !this.prvRef.running && !!this.ref.selectedFile)),
        }).value;
        this.ffmpeg.load().then(() => {
            this.prvRef.inited = true;
            this.ref.progress = 0;
            this.ffmpeg.setProgress(pgr => this.ref.progress = pgr.ratio);
        }).catch(e => alert("Cannot load the converter.\nReason:\n" + e));
    }
    ffmpeg: FFmpeg;
    ref: {
        selectedFile: File;
        outputFile: File;
        progress: number;
        readyToConvert: boolean;
    };
    selectFile(): Promise<File> {
        return new Promise(resolve => {
            selector.onchange = () => {
                this.ref.selectedFile = selector.files![0];
                resolve(selector.files![0]);
            }
            selector.click();
        });
    }
    async convert(convertOptions: String, outputExtension: string) {
        const inptFile = this.ref.selectedFile;
        const name = inptFile.name.substr(0, inptFile.name.lastIndexOf(".")) + outputExtension;
        const mimeTypes: { [ext: string]: string } = {
            ".mp4": "video/mp4",
            ".mkv": "video/x-matroska",
            ".webm": "video/webm",
            ".ogv": "video/ogg",
            ".mpeg": "video/mpeg",
            ".avi": "video/x-msvideo",
            ".mov": "video/quicktime",
            ".3gp": "video/3gpp"
        }
        const output = "output" + outputExtension;
        this.prvRef.running = true;
        this.ffmpeg.FS(
            "writeFile",
            inptFile.name,
            await fetchFile(inptFile)
        );
        await this.ffmpeg.run(
            "-i",
            inptFile.name,
            ...convertOptions.split(/[ ]+/),
            output
        ).catch(e => alert(e));
        this.ref.outputFile = new File([this.ffmpeg.FS("readFile", output).buffer], name, { lastModified: Date.now(), type: `video/${mimeTypes[outputExtension]}` });
        this.ffmpeg.FS("unlink", output);
        this.ffmpeg.FS("unlink", inptFile.name);
        this.prvRef.running = false;
    }
}