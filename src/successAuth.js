import Trakt from "trakt.tv"
import { TraktOptions } from "./utils/constants"

const url = new URL(location.href)
const code = url.searchParams.get("code")
const state = url.searchParams.get("state")
const api = new Trakt(TraktOptions)

api.exchange_code(code).then(result => {
  chrome.storage.sync.set({ token: api.export_token() })
})
