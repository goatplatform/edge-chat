// @deno-types="npm:@types/react"
import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
import { useDB, useItem, useQuery } from "@goatdb/goatdb/react";
import { styled } from "styled-components";
import { kSchemaMessage, SchemaMessage, SchemaUISettings } from "../schema.ts";
import { dummy } from "../models/dummy.ts";
import { wllamaGenerate } from "../models/wllama.ts";
import { ManagedItem } from "@goatdb/goatdb";

const kLanguageModels: Record<
  string,
  (
    prompt: string,
    onProgress: (status: string, progress: number) => void,
  ) => Promise<string>
> = {
  Dummy: async (prompt) => dummy(prompt),
  TinyLlama: wllamaGenerate,
};

const ChatAreaComponent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ProgressContainer = styled.div`
  margin-top: 8px;
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f5f5;
`;

const ProgressBar = styled.div<{ width: number }>`
  height: 4px;
  width: ${(props) => props.width}%;
  background-color: #4caf50;
  transition: width 0.3s ease;
`;
const InputAreaComponent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
  flex-direction: row; // Ensure everything stays in one line
`;

const ModelSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Inter', serif;
  font-size: 14px;
  outline: none;
  cursor: pointer;
  margin-left: 4px;

  &:focus {
    border-color: #007aff;
  }
`;

const InputLabel = styled.label`
  font-family: 'Inter', serif;
  font-size: 14px;
  white-space: nowrap;
`;

const MessageListComponent = styled.div`
  display: flex;
  flex-direction: column; // Changed from column-reverse to column
  padding: 20px;
  overflow-y: auto;
  height: calc(100vh - 160px);
`;

const MessageComponent = styled.div<{ align: "start" | "end" }>`
  max-width: 80%;
  min-width: 200px;
  padding: 12px 16px;
  margin: 8px;
  border-radius: 12px;
  font-family: 'Inter', serif;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;

  align-self: ${(props) => props.align};
  background-color: ${(props) => props.align === "end" ? "#005aff" : "#f0f0f0"};
  color: ${(props) => (props.align === "end" ? "white" : "black")};
  border: none;

  /* Add shadow for depth */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const InputContainer = styled.div`
  bottom: 0;
  left: 200px;
  right: 0;
  background: white;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const InputField = styled.input`
  width: 100%;
  max-width: 800px;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Inter', serif;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #005aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
  }
`;

export type MessageProps = {
  path: string;
};

export function Message({ path }: MessageProps) {
  const item = useItem<SchemaMessage>(path);
  const align = item.get("modelId") === undefined ? "end" : "start";
  const text = item.get("text") || "";
  const isTyping = text.endsWith("...");

  return (
    <MessageComponent align={align}>
      {text}
      {isTyping && <span className="typing-indicator">▋</span>}
    </MessageComponent>
  );
}

export type MessageListProps = {
  path: string;
  ref: React.Ref<HTMLDivElement>;
};

export function MessageList({ path, ref }: MessageListProps) {
  console.log(`Selected chat = ${path}`);
  const query = useQuery({
    schema: kSchemaMessage,
    source: path,
    sortDescriptor: ({ left, right }) =>
      left.get("dateSent").getTime() - right.get("dateSent").getTime(),
  });
  return (
    <MessageListComponent ref={ref}>
      {query.results().map((item) => (
        <Message path={item.path} key={item.path} />
      ))}
    </MessageListComponent>
  );
}

export type ChatAreaProps = {
  userId: string;
};

export function ChatArea({ userId }: ChatAreaProps) {
  const db = useDB();
  const [model, setModel] = useState("TinyLlama");
  const [isLoading, setIsLoading] = useState(false);
  const uiSettings = useItem<SchemaUISettings>("user", userId, "UISettings");
  const path = uiSettings.get("selectedChat");
  const [loadingStatus, setLoadingStatus] = useState<string>("");
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const messageListRef = useRef<HTMLDivElement>(null);

  if (!path) {
    return (
      <ChatAreaComponent>
        <div>👈 Please select a chat</div>
      </ChatAreaComponent>
    );
  }
  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;

    setIsLoading(true);
    const userMsg = db.create(path, kSchemaMessage, {
      text: text,
      dateSent: new Date(),
    });

    let botMsg: ManagedItem<SchemaMessage> | undefined;

    try {
      let currentResponse = "";
      const resp = await kLanguageModels[model](text, (status, progress) => {
        setLoadingStatus(status);
        setLoadingProgress(progress);
        if (!botMsg) {
          botMsg = db.create(path, kSchemaMessage, {
            text: "...",
            modelId: model,
            replyTo: userMsg.path,
            dateSent: new Date(),
          });
        }
        if (status.startsWith("Generating: ")) {
          currentResponse = status.replace("Generating: ", "");
          botMsg.set("text", currentResponse + "...");
        }
      });

      if (!botMsg) {
        botMsg = db.create(path, kSchemaMessage, {
          text: "...",
          modelId: model,
          replyTo: userMsg.path,
          dateSent: new Date(),
        });
      }
      botMsg.set("text", resp);
    } catch (error) {
      console.error("Error details:", error);
      if (!botMsg) {
        botMsg = db.create(path, kSchemaMessage, {
          text: "...",
          modelId: model,
          replyTo: userMsg.path,
          dateSent: new Date(),
        });
      }
      botMsg.set("text", "Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
      setLoadingProgress(0);
    }
  };
  return (
    <ChatAreaComponent>
      <MessageList path={path} ref={messageListRef} />
      <InputContainer>
        <InputAreaComponent>
          <InputLabel htmlFor="InputField">Type something...</InputLabel>
          <InputField
            id="InputField"
            disabled={isLoading}
            onKeyPress={async (event: KeyboardEvent) => {
              if (event.key === "Enter") {
                const input = event.target as HTMLInputElement;
                const text = input.value;
                if (text) {
                  input.value = "";
                  await handleSubmit(text);
                }
              }
            }}
          />
          <InputLabel htmlFor="ModelSelect">Model:</InputLabel>
          <ModelSelect
            id="ModelSelect"
            onInput={(event: InputEvent) => {
              setModel((event.target as HTMLSelectElement).value);
            }}
            defaultValue="TinyLlama"
          >
            <option>Dummy</option>
            <option>TinyLlama</option>
          </ModelSelect>
          {isLoading && (
            <ProgressContainer>
              <div>{loadingStatus}</div>
              <ProgressBar width={loadingProgress} />
            </ProgressContainer>
          )}
        </InputAreaComponent>
      </InputContainer>
    </ChatAreaComponent>
  );
}
