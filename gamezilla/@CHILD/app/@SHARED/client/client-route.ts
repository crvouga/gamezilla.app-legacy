import { UserId } from "gamezilla/@CHILD/app/@SHARED/data"
import { SpaceId } from "gamezilla/@CHILD/app/@SHARED/data/space-id"
import { PhoneNumber } from "gamezilla/@SHARED/core"

//
//
//
// Model
//
//
//

export type Location = {
  pathname: string
  searchParams?: URLSearchParams
}

export type AppRoute =
  | { t: "auth"; c: RouteAuth; location?: Location }
  | { t: "logout" }
  | { t: "profile"; c: RouteProfile }
  | { t: "spaces"; c: RouteGameSpace }
  | { t: "chat"; c: RouteChat }
  | { t: "search" }

const encode = (route: AppRoute): string => {
  switch (route.t) {
    case "auth":
      return encodeAuth(route.c)
    case "logout":
      return "/logout"
    case "profile":
      return encodeProfile(route.c)
    case "spaces":
      return encodeSpace(route.c)
    case "chat":
      return encodeChat(route.c)
    case "search":
      return "/search"
  }
}

const decode = (pathname: string): AppRoute | null => {
  if (pathname.startsWith("/auth")) {
    const auth = decodeAuth(pathname)
    if (auth === null) {
      return null
    }
    return { t: "auth", c: auth }
  }
  if (pathname.startsWith("/profile")) {
    const profile = decodeProfile(pathname)
    if (profile === null) {
      return null
    }
    return { t: "profile", c: profile }
  }
  if (pathname.startsWith("/space")) {
    const space = decodeSpace(pathname)
    if (space === null) {
      return null
    }
    return { t: "spaces", c: space }
  }
  if (pathname.startsWith("/chat")) {
    const chat = decodeChat(pathname)
    if (chat === null) {
      return null
    }
    return { t: "chat", c: chat }
  }
  if (pathname.startsWith("/search")) {
    return { t: "search" }
  }
  if (pathname.startsWith("/logout")) {
    return { t: "logout" }
  }
  return null
}

//
//
// Auth
//
//

export type RouteAuth =
  | { t: "login" }
  | { t: "login-email-link" }
  | { t: "login-phone"; isSelectingCountry: boolean }
  | { t: "login-phone-verify"; phoneNumber: PhoneNumber }

export const encodeAuth = (route: RouteAuth): string => {
  switch (route.t) {
    case "login":
      return "/auth/login"
    case "login-email-link":
      return "/auth/login/email-link"
    case "login-phone":
      return "/auth/login/phone"
    case "login-phone-verify":
      return `/auth/login/phone/verify/${
        route.phoneNumber._country
      }/${PhoneNumber.toString(route.phoneNumber)}`
  }
}
export const decodeAuth = (pathname: string): RouteAuth | null => {
  if (pathname === "/auth/login") {
    return { t: "login" }
  }
  if (pathname === "/auth/login/email-link") {
    return { t: "login-email-link" }
  }
  if (pathname === "/auth/login/phone") {
    return { t: "login-phone", isSelectingCountry: false }
  }
  if (pathname === "/auth/login/phone/select-country") {
    return { t: "login-phone", isSelectingCountry: true }
  }
  if (pathname.startsWith("/auth/login/phone/verify/")) {
    const split = pathname.split("/")
    const phoneNumber = split[split.length - 1]
    if (!phoneNumber) {
      return null
    }
    const decoded = PhoneNumber.parse(phoneNumber)
    if (decoded.t === "err") {
      return null
    }
    return {
      t: "login-phone-verify",
      phoneNumber: decoded.value,
    }
  }

  return null
}

//
//
// Profile
//
//

export type RouteProfile =
  | { t: "profile"; userId: UserId }
  | { t: "profile-delete" }
  | { t: "profile-update" }
  | { t: "profile-update-avatar" }
  | { t: "profile-update-username" }

export const encodeProfile = (route: RouteProfile): string => {
  switch (route.t) {
    case "profile":
      return `/profile/${route.userId}`
    case "profile-delete":
      return "/profile-delete"
    case "profile-update":
      return "/profile-update"
    case "profile-update-avatar":
      return "/profile-update-avatar"
    case "profile-update-username":
      return "/profile-update-username"
  }
}
export const decodeProfile = (pathname: string): RouteProfile | null => {
  if (pathname.startsWith("/profile/")) {
    const userId = pathname.slice("/profile/".length)
    if (UserId.is(userId)) {
      return { t: "profile", userId }
    }
    return null
  }
  if (pathname === "/profile-delete") {
    return { t: "profile-delete" }
  }
  if (pathname === "/profile-update") {
    return { t: "profile-update" }
  }
  if (pathname === "/profile-update-avatar") {
    return { t: "profile-update-avatar" }
  }
  if (pathname === "/profile-update-username") {
    return { t: "profile-update-username" }
  }

  return null
}

//
//
// Space
//
//

export type RouteGameSpace =
  | { t: "space"; spaceId: SpaceId }
  | { t: "space-list" }

export const encodeSpace = (route: RouteGameSpace): string => {
  switch (route.t) {
    case "space":
      return `/space/${route.spaceId}`
    case "space-list":
      return "/space"
  }
}
export const decodeSpace = (pathname: string): RouteGameSpace | null => {
  if (pathname.startsWith("/space/")) {
    const spaceId = pathname.slice("/space/".length)
    if (SpaceId.is(spaceId)) {
      return { t: "space", spaceId }
    }
    return null
  }
  if (pathname === "/space") {
    return { t: "space-list" }
  }
  return null
}

//
//
// Chat
//
//
export type RouteChat =
  | { t: "chat" }
  | { t: "chat-new" }
  | { t: "chat-conversation"; conversationId: string }

export const encodeChat = (route: RouteChat): string => {
  switch (route.t) {
    case "chat":
      return "/chat"
    case "chat-new":
      return "/chat/new"
    case "chat-conversation":
      return `/chat/conversation/${route.conversationId}`
  }
}
export const decodeChat = (pathname: string): RouteChat | null => {
  if (pathname === "/chat") {
    return { t: "chat" }
  }
  if (pathname === "/chat/new") {
    return { t: "chat-new" }
  }
  if (pathname.startsWith("/chat/conversation/")) {
    const conversationId = pathname.slice("/chat/conversation/".length)
    return { t: "chat-conversation", conversationId }
  }
  return null
}

//
//
//
//
//
//
//

const eq = (a: AppRoute, b: AppRoute): boolean => {
  return encode(a) === encode(b)
}

export const AppRoute = {
  eq,
  encode,
  decode,
}
