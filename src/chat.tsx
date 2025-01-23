// @deno-types="npm:@types/react"
import React, { KeyboardEvent, useEffect, useState } from 'react';
import { useDB, useItem, useQuery } from '@goatdb/goatdb/react';
import { css, styled } from 'styled-components';
import { kSchemaMessage, SchemaMessage, SchemaUISettings } from '../schema.ts';
import { dummy } from '../models/dummy.ts';
import { wllamaGenerate } from '../models/wllama.ts';

const kLanguageModels: Record<
  string,
  (
    prompt: string,
    onProgress: (status: string, progress: number) => void
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

const MessageListComponent = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
  padding-right: 16px;
  padding-left: 16px;
`;

const MessageComponent = styled.div`
  border: 1px solid black;
  border-radius: 10px;
  padding-left: 4px;
  box-sizing: border-box;
  margin-top: 8px;
  margin-bottom: 8px;
  margin-right: 4px;
  margin-left: 4px;
  width: 300px;
  font-family: 'Inter', serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
`;

const InputAreaComponent = styled.div`
  /* height: 56px; */
  width: 100%;
  margin-bottom: 16px;
  margin-top: 16px;
  /* border-bottom: 1px solid black; */
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  /* padding: 8px; */
`;

const InputContainer = styled.div`
  margin-left: auto;
  margin-right: auto;
  /* padding-left: 8px;
  padding-right: 8px; */
`;

const InputField = styled.input`
  width: 300px;
  font-family: 'Inter', serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  margin-right: 4px;
`;

const InputLabel = styled.label`
  font-family: 'Inter', serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  margin-right: 4px;
`;

const ModelSelect = styled.select`
  font-family: 'Inter', serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
  margin-right: 4px;
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

export type MessageProps = {
  path: string;
};

export function Message({ path }: MessageProps) {
  const item = useItem<SchemaMessage>(path);
  const align = item.get('modelId') === undefined ? 'end' : 'start';
  return (
    <MessageComponent style={{ alignSelf: align }}>
      {item.get('text')}
    </MessageComponent>
  );
}

export type MessageListProps = {
  path: string;
};

export function MessageList({ path }: MessageListProps) {
  console.log(`Selected chat = ${path}`);
  const query = useQuery({
    schema: kSchemaMessage,
    source: path,
    sortDescriptor: ({ left, right }) =>
      right.get('dateSent').getTime() - left.get('dateSent').getTime(),
  });
  return (
    <MessageListComponent>
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
  const [model, setModel] = useState('Dummy');
  const [isLoading, setIsLoading] = useState(false);
  const uiSettings = useItem<SchemaUISettings>('user', userId, 'UISettings');
  const path = uiSettings.get('selectedChat');
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  useEffect(() => {
    console.log(
      'Current window.Transformers status:',
      (window as any).Transformers
    );
  }, []);

  if (!path) {
    return (
      <ChatAreaComponent>
        <div>👈 Please select a chat</div>
      </ChatAreaComponent>
    );
  }

  return (
    <ChatAreaComponent>
      <InputContainer>
        <InputAreaComponent>
          <InputLabel htmlFor="InputField">Type something...</InputLabel>
          <InputField
            id="InputField"
            disabled={isLoading}
            onKeyPress={async (event: KeyboardEvent) => {
              if (event.key === 'Enter') {
                const input = event.target as HTMLInputElement;
                const text = input.value;
                if (text) {
                  setIsLoading(true);
                  const msg = db.create(path, kSchemaMessage, {
                    text,
                  });
                  try {
                    const resp = await kLanguageModels[model](
                      text,
                      (status, progress) => {
                        setLoadingStatus(status);
                        setLoadingProgress(progress);
                      }
                    );
                    db.create(path, kSchemaMessage, {
                      text: resp,
                      modelId: model,
                      replyTo: msg.path,
                    });
                  } catch (error) {
                    console.error('Error details:', error);
                    console.error(
                      'Current window.Transformers status:',
                      (window as any).Transformers
                    );
                    db.create(path, kSchemaMessage, {
                      text: 'Sorry, I encountered an error. Please try again.',
                      modelId: model,
                      replyTo: msg.path,
                    });
                  } finally {
                    setIsLoading(false);
                    setLoadingStatus('');
                    setLoadingProgress(0);
                  }
                  input.value = '';
                }
              }
            }}
          />
          {isLoading && (
            <ProgressContainer>
              <div>{loadingStatus}</div>
              <ProgressBar width={loadingProgress} />
            </ProgressContainer>
          )}
        </InputAreaComponent>

        <InputAreaComponent>
          <InputLabel htmlFor="ModelSelect">Model:</InputLabel>
          <ModelSelect
            id="ModelSelect"
            onInput={(event: InputEvent) => {
              setModel((event.target as HTMLSelectElement).value);
            }}
            defaultValue="Dummy">
            <option>Dummy</option>
            <option>TinyLlama</option>
          </ModelSelect>
        </InputAreaComponent>
      </InputContainer>
      <MessageList path={path} />
    </ChatAreaComponent>
  );
}
