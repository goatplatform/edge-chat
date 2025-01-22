// deno-lint-ignore no-unused-vars
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../src/app.tsx';
import { registerSchemas } from '../schema.ts';

registerSchemas();

const domNode = document.getElementById('root')!;

const root = createRoot(domNode);
root.render(<App />);
