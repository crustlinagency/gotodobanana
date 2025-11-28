import { superdevClient } from "@/lib/superdev/client";

export const Comment = superdevClient.entity("Comment");
export const List = superdevClient.entity("List");
export const Tag = superdevClient.entity("Tag");
export const Task = superdevClient.entity("Task");
export const User = superdevClient.auth;
