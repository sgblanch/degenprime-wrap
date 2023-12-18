#!/usr/bin/env/python3

import sys
from importlib import resources
from pathlib import Path
from wasmtime import Module, Store, WasiConfig, Linker, ExitTrap
from . import libexec

#KeyboardInterrupt

def degenprime(args: list[str] = sys.argv[1:]) -> int:
    # dirty hack to find the dirname of the input file
    workdir = None
    if len(args) > 0:
        inputFile = Path(args[-1])
        if inputFile.exists():
            workdir = str(inputFile.parent)
            args[-1] = str(inputFile.name)

    wasi = WasiConfig()
    wasi.inherit_env()
    wasi.inherit_stdin()
    wasi.inherit_stdout()
    wasi.inherit_stdin()
    wasi.argv = ["degenprime"] + args
    if workdir is not None:
        wasi.preopen_dir(workdir, "/")

    store = Store()
    store.set_wasi(wasi)

    wasm = resources.files(libexec).joinpath("degenprime.wasm")
    module = Module.from_file(store.engine, wasm)

    linker = Linker(store.engine)
    linker.define_wasi()
    instance = linker.instantiate(store, module)

    try:
        instance.exports(store).get("_start")(store)
        return 0
    except ExitTrap as trap:
        return trap.code
