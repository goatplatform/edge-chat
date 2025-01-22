// @deno-types="npm:@types/react"
import React from "react";
import { kSchemaChat, SchemaChat, SchemaUISettings } from "../schema.ts";
import { useDB, useItem, useQuery } from "@goatdb/goatdb/react";
import { css, styled } from "styled-components";
import { itemPathGetPart, ManagedItem, Repository } from "@goatdb/goatdb";

const ChatButton = styled.div<{ selected?: boolean; firstButton?: boolean }>`
text-align: center;
border-bottom: 1px solid black;
width: 100%;
box-sizing: border-box;
padding: 2px;
font-family: "Inter", serif;
font-optical-sizing: auto;
font-weight: 400;
font-style: normal;

${(props) =>
  props.selected && css`
  background-color: lightgray;
`}

${(props) =>
  props.firstButton && css`
  border-top: 1px solid black;
`}
`;

const NewButton = styled.div`
text-align: center;
border-bottom: 1px solid black;
width: 100%;
margin-bottom: 24px;
font-family: "Inter", serif;
font-optical-sizing: auto;
font-weight: 700;
font-style: normal;
`;

const ChatListComponent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  width: 200px;
  height: 100%;
  border-right: 1px solid black;
`;

export type ChatListItemProps = {
  path: string;
  userId: string;
  firstItem?: boolean;
};

function dataPathFromChat(chat: ManagedItem<SchemaChat>): string {
  return Repository.path("data", itemPathGetPart(chat.path, "item"));
}

export function ChatListItem({ path, userId, firstItem }: ChatListItemProps) {
  const chat = useItem<SchemaChat>(path);
  const uiSettings = useItem<SchemaUISettings>("user", userId, "UISettings");
  return (
    <ChatButton
      onClick={() => {
        if (uiSettings.get("selectedChat") === dataPathFromChat(chat)) {
          uiSettings.delete("selectedChat");
        } else {
          uiSettings.set(
            "selectedChat",
            dataPathFromChat(chat),
          );
        }
      }}
      selected={uiSettings.get("selectedChat") === dataPathFromChat(chat)}
      firstButton={firstItem === true}
    >
      {chat.get("title")}
    </ChatButton>
  );
}

export type ChatListProps = {
  userId: string;
};

export function ChatList({ userId }: ChatListProps) {
  const db = useDB();
  const registryRepo = `/user/${userId}`;
  const query = useQuery({
    schema: kSchemaChat,
    source: registryRepo,
    sortDescriptor: ({ left, right }) =>
      right.get("lastModified").getTime() - left.get("lastModified").getTime(),
  });
  const uiSettings = useItem<SchemaUISettings>("user", userId, "UISettings");
  return (
    <ChatListComponent>
      <NewButton
        onClick={() => {
          const item = db.create(registryRepo, kSchemaChat, {
            title: `Chat ${query.count + 1}`,
          });
          uiSettings.set("selectedChat", dataPathFromChat(item));
        }}
      >
        New Chat
      </NewButton>
      {query.results().map((item, idx) => (
        <ChatListItem
          path={item.path}
          key={item.path}
          userId={userId}
          firstItem={idx === 0}
        />
      ))}
    </ChatListComponent>
  );
}
