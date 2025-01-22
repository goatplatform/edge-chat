import { SchemaManager } from "@goatdb/goatdb";

/**
 * A schema defines the structure of items that can be stored in the DB.
 * Adding a new schema involves these 3 steps:
 *
 * 1. Define a new const schema definition.
 *    Tip: Remember the as const in the end.
 *
 *    export const kSchemaMyItem = {
 *      ns: 'MyItem',
 *      version: 1,
 *      fields: {
 *        title: {
 *          type: 'string',
 *          default: () => 'Untitled',
 *        },
 *        value: {
 *          type: 'number',
 *          required: true,
 *        },
 *      },
 *    } as const;
 *
 * 2. Define a utility type for this const.
 *
 *    export type SchemaMyItem = typeof kSchemaMyItem;
 *
 * 3. Edit the registerSchemas() function at the bottom of this file and
 *    include a call to manager.register().
 *
 *    manager.register(kSchemaMyItem);
 */
export const kSchemaChat = {
  ns: "Chat",
  version: 1,
  fields: {
    title: {
      type: "string",
      default: () => "Untitled Chat",
    },
    lastModified: {
      type: "date",
      default: () => new Date(),
    },
  },
} as const;
export type SchemaChat = typeof kSchemaChat;

export const kSchemaMessage = {
  ns: "Message",
  version: 1,
  fields: {
    text: {
      type: "string",
      required: true,
    },
    dateSent: {
      type: "date",
      default: () => new Date(),
    },
    modelId: {
      type: "string",
    },
    replyTo: {
      type: "string",
    },
  },
} as const;
export type SchemaMessage = typeof kSchemaMessage;

export const kSchemaUISettings = {
  ns: "UISettings",
  version: 1,
  fields: {
    selectedChat: {
      type: "string",
    },
  },
} as const;
export type SchemaUISettings = typeof kSchemaUISettings;

// ====== Add new schemas here ====== //

/**
 * This is the main registration function for all schemas in this project.
 * It gets called from both the client and the server code so they agree on the
 * same schemas.
 *
 * @param manager The schema manager to register with.
 *                Uses {@link SchemaManager.default} if not provided.
 */
export function registerSchemas(
  manager: SchemaManager = SchemaManager.default,
): void {
  manager.register(kSchemaChat);
  manager.register(kSchemaMessage);
  manager.register(kSchemaUISettings);
}
