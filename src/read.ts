const selector = document.createElement("input");
selector.type = "file";
selector.accept = "video/*";
(<any>window).selector = selector;
export default function readFile(): Promise<[File, ArrayBuffer]> {
    return new Promise(resolve => {
        selector.onchange = function () {
            if(!(selector.files![0])) return alert("Please choose a file");
            const file = selector.files![0];

            const reader = new FileReader();
            reader.onload = function(){
                resolve([file, <ArrayBuffer>reader.result]);
            }
            reader.readAsArrayBuffer(file);
        }
        selector.click();
    });
}