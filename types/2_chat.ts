/**
 * MTKruto - Cross-runtime JavaScript library for building Telegram clients
 * Copyright (C) 2023-2024 Roj <https://roj.im/>
 *
 * This file is part of MTKruto.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { unreachable } from "../0_deps.ts";
import { types } from "../2_tl.ts";
import { EntityGetter } from "./_getters.ts";
import { constructOpeningHours, OpeningHours } from "./0_opening_hours.ts";
import { ChatPChannel, ChatPGroup, ChatPPrivate, ChatPSupergroup, constructChatP } from "./1_chat_p.ts";
import { constructPhoto } from "./1_photo.ts";
import { Photo } from "./1_photo.ts";
import { constructLocation, Location } from "./0_location.ts";
import { Birthday, constructBirthday } from "./0_birthday.ts";
import { cleanObject } from "../1_utilities.ts";

export interface ChatBase {
  photo?: Photo;
}

/** @unlisted */
export interface ChatChannel extends ChatBase, ChatPChannel {
  also?: string[];
  videoChatId?: string;
}

/** @unlisted */
export interface ChatSupergroup extends ChatBase, ChatPSupergroup {
  also?: string[];
  videoChatId?: string;
}

/** @unlisted */
export interface ChatGroup extends ChatBase, ChatPGroup {
  videoChatId?: string;
}

/** @unlisted */
export interface ChatPrivate extends ChatBase, ChatPPrivate {
  also?: string[];
  /** The user's birthday. */
  birthday?: Birthday;
  /** The written address of the business. */
  address?: string;
  /** The exact location of the business. */
  location?: Location;
  /** The opening hours of the business. */
  openingHours?: OpeningHours;
}

/**
 * A chat with more fields.
 */
export type Chat = ChatChannel | ChatSupergroup | ChatGroup | ChatPrivate;

export async function constructChat(fullChat: types.UserFull | types.ChatFull | types.ChannelFull, getEntity: EntityGetter): Promise<Chat> {
  if (fullChat instanceof types.UserFull) {
    const user = await getEntity(new types.PeerUser({ user_id: fullChat.id }));
    if (user == null) unreachable();
    const chatP = constructChatP(user);
    return cleanObject({
      ...chatP,
      birthday: fullChat.birthday ? constructBirthday(fullChat.birthday) : undefined,
      photo: fullChat.profile_photo && fullChat.profile_photo instanceof types.Photo ? constructPhoto(fullChat.profile_photo) : undefined,
      address: fullChat.business_location?.address,
      location: fullChat.business_location?.geo_point && fullChat.business_location.geo_point instanceof types.GeoPoint ? constructLocation(fullChat.business_location.geo_point) : undefined,
      openingHours: fullChat.business_work_hours ? constructOpeningHours(fullChat.business_work_hours) : undefined,
    });
  } else if (fullChat instanceof types.ChatFull) {
    const chat = await getEntity(new types.PeerChat({ chat_id: fullChat.id }));
    if (chat == null) unreachable();
    const chatP = constructChatP(chat);
    return cleanObject({
      ...chatP,
      photo: fullChat.chat_photo && fullChat.chat_photo instanceof types.Photo ? constructPhoto(fullChat.chat_photo) : undefined,
      videoChatId: fullChat.call ? String(fullChat.call.id) : undefined,
    });
  } else if (fullChat instanceof types.ChannelFull) {
    const chat = await getEntity(new types.PeerChannel({ channel_id: fullChat.id }));
    if (chat == null) unreachable();
    const chatP = constructChatP(chat);
    return cleanObject({
      ...chatP,
      photo: fullChat.chat_photo && fullChat.chat_photo instanceof types.Photo ? constructPhoto(fullChat.chat_photo) : undefined,
      videoChatId: fullChat.call ? String(fullChat.call.id) : undefined,
    });
  }
  unreachable();
}
