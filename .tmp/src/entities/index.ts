import { superdevClient } from "@/lib/superdev/client";

export const Attachment = superdevClient.entity("Attachment");
export const Comment = superdevClient.entity("Comment");
export const FilterPreset = superdevClient.entity("FilterPreset");
export const List = superdevClient.entity("List");
export const Subtask = superdevClient.entity("Subtask");
export const Tag = superdevClient.entity("Tag");
export const Note = superdevClient.entity("Note");
export const Task = superdevClient.entity("Task");
export const User = superdevClient.auth;
