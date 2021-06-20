const selector = document.createElement("input");
selector.type = "file";
selector.accept = "video/*";
(<any>window).selector = selector;
export default function selectFile(): Promise<File> {
    return new Promise(resolve => {
        selector.onchange = function () {
            resolve(selector.files![0]);
        }
        selector.click();
    });
}