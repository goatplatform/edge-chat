# EdgeChat

This is a demo of a ChatGPT-like interface that runs completely in the browser,
no network connection needed. It uses
[GoatDB](https://github.com/goatplatform/goatdb) for storing chat history, and
[wllama](https://github.com/ngxson/wllama) for running the models.

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

## But Why?

- **⚡ Low Latency**: GoatDB enables direct, on-device data retrieval for SLM
  inference, bypassing network calls and ensuring minimal latency during
  operations.

- **🔒 End-to-End Secure Data Movement**: Data can synchronize directly between
  edge devices without exposure to the central server.

- **🌐 Offline-First Support**: GoatDB allows the application to function
  entirely offline by persisting all required data locally, which is critical in
  low or no connectivity environments.

- **📡 Incremental Synchronization**: Synchronization occurs in small, efficient
  deltas, reducing network traffic and avoiding full dataset transfers while
  maintaining consistency.

- **🧠 Local Context Awareness**: Storing contextual data (e.g., user history or
  preferences) locally allows SLMs to generate contextually relevant results
  without requiring external lookups.

- **📊 Decentralized Scalability**: By offloading inference and data storage to
  the edge, server-side resource requirements are minimized, enabling
  cost-effective scaling.

- **🔧 Optimized for Edge Devices**: GoatDB is designed for environments with
  limited compute, memory, or power, making it highly suitable for mobile and
  IoT hardware.

- **📈 Real-Time Data Consistency**: With on-device updates, the SLM processes
  the latest input data in real time, ensuring timely and accurate results.
