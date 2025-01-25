// @deno-types="npm:@types/react"
import React from "react";
import { useDBReady, useItem } from "@goatdb/goatdb/react";
import { ChatList } from "./chat-list.tsx";
import { kSchemaUISettings, SchemaUISettings } from "../schema.ts";
import { css, styled } from "styled-components";
import { ChatArea } from "./chat.tsx";

const ContentsComponent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

export function Contents() {
  const userId = "TestUserId";
  const uiSettings = useItem<SchemaUISettings>("user", userId, "UISettings");
  if (uiSettings.schema.ns === null) {
    uiSettings.schema = kSchemaUISettings;
  }
  return (
    <ContentsComponent>
      <ChatList userId={userId} />
      <ChatArea userId={userId} />
    </ContentsComponent>
  );
}

export function App() {
  const ready = useDBReady();
  // Handle initial loading phase
  if (ready === "loading") {
    return <div>Loading...</div>;
  }
  if (ready === "error") {
    return <div>Error! Please reload the page.</div>;
  }
  // Once  loaded, continue to the contents of the app
  return <Contents />;
}
