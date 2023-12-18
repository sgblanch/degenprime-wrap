# degenprime-wrap

This is an experiment in the viability of compiling [DeGenPrime](https://github.com/raw-lab/DeGenPrime) to Web Assembly.  The hope is that WASM (specifically WASI) will permit DeGenPrime to run locally in a web browser and perhaps as a base for a cross-platform distribution.

## Known Limitations

- No MAFFT integration

## Using this repo

> **Warning**
>
> Here be dragons.  The instructions below are a rough guide, not well tested, and probably wont work for you.  Using vscode and the devcontainer to compile degenprime to web assembly is highly recommended

```console
git clone https://github.com/sgblanch/DeGenPrime.git degenprime
git -C degenprime checkout wasm-support
cmake -DCMAKE_BUILD_TYPE:STRING=Release -DCMAKE_TOOLCHAIN_FILE:FILEPATH=degenprime/src/wasi-sdk.cmake -S degenprime/src -B degenprime/build -G Ninja
cmake --build degenprime/build --config Release --target all --
make
```
