# edge-chat

This is a demo of a ChatGPT-like interface that runs completely on the edge
device, no network connection needed. It used
[GoatDB](https://github.com/goatplatform/goatdb) for storing chat history, and
[lmstudio.js](https://github.com/lmstudio-ai/lmstudio.js) for running the
models.

## Getting Started

Before continuing, make sure you have Deno 2+ installed. If not, install it from
[here](https://docs.deno.com/runtime/getting_started/installation/). Then, run
the following commands inside your project's directory.

### Running the Demo

```bash
deno task debug
```

### Cleaning the Server Data

```bash
deno task clean
```
