"use strict";

import { WASI, Fd, File as WFile, PreopenDirectory } from "@bjorn3/browser_wasi_shim";

(() => {
    const decoder = new TextDecoder("utf-8");

    class Stdio extends Fd {
        fd_write(view8, iovs) {
            let nwritten = 0;
            let text = "";
            for (let iovec of iovs) {
                text = decoder.decode(view8.slice(iovec.buf, iovec.buf + iovec.buf_len))
                document.getElementById("output").innerText += text;
                console.log(text);
                nwritten += iovec.buf_len;
            }
            return { ret: 0, nwritten };
        }
    }

    window.DeGenPrime = class {
        #fds = [
            new Fd(), // stdin
            new Stdio(), // stdout
            new Stdio(), // stderr
        ];
        #file;
        #mod;
        #inst;
        wasi;

        constructor() {
            this.wasi = new WASI();
            WebAssembly.instantiateStreaming(fetch("degenprime.wasm"), {
                "wasi_snapshot_preview1": this.wasi.wasiImport,
            }).then((result) => {
                this.#mod = result.module;
                this.#inst = result.instance;
                document.getElementById("runButton").disabled = false;
            }).catch((err) => {
                console.error(err);
            });
        }

        async setFile(input) {
            this.#file = input.files[0];
        }

        async run() {
            let args = ["degenprime"]
            let fds = this.#fds.slice() // (shallow) copy global file descriptors

            if (this.#file !== undefined) {
                // create a virtual fs containing input file and add it to
                // the list of file descriptors to pass to WASI
                fds.push(new PreopenDirectory("/", {
                    [this.#file.name]: new WFile(await this.#file.arrayBuffer())
                }))
                // add input file name to degenprime's command line
                args.push(this.#file.name)
            }

            // run degenprime using command line 'args' and file descriptors 'fd'
            this.wasi.args = args;
            this.wasi.fds = fds;
            this.wasi.start(this.#inst);

            // Check if degenprime created an output file and provide a download link
            let filename = this.#file.name.substr(0, this.#file.name.lastIndexOf('.')) + ".dgp";
            if (fds[3].dir.contents[filename] !== undefined) {
                let download = document.createElement('a');
                download.href = URL.createObjectURL(new File([fds[3].dir.contents[filename].data], filename, { type: "text/plain" }))
                download.innerText = filename;
                download.setAttribute('download', filename);
                document.getElementById("downloads").appendChild(download)
                document.getElementById("downloads").appendChild(document.createElement('br'))
            }

            // Reset instance
            this.#inst = await WebAssembly.instantiate(this.#mod, {
                "wasi_snapshot_preview1": this.wasi.wasiImport,
            });
            document.getElementById("inputfile").value = "";
            this.#file = undefined;
        }

    }
})();
