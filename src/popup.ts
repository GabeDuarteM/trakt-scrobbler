import { ErrorLog } from "./utils/logger"
import * as Trakt from "trakt.tv"
import { TraktOptions } from "./utils/constants"
import { TokenT } from "../typings/trakt.tv"

UpdateUI()
const api = new Trakt(TraktOptions)

function UpdateUI(): void {
  chrome.storage.sync.get("token", (val: ChromeObjT<TokenT>) => {
    const btn = document.querySelector("#btn-auth")

    if (!btn || !(btn instanceof HTMLAnchorElement)) {
      throw ErrorLog("Authorization button not found")
    }

    if (val.token && val.token.access_token) {
      btn.classList.add("logout")
      btn.classList.remove("login")
      btn.innerText = "Logout"
      btn.onclick = Logout

      api.import_token(val.token)
    } else {
      btn.classList.add("login")
      btn.classList.remove("logout")
      btn.text = "Authorize"
      btn.setAttribute("href", api.get_url())
    }
  })
}

function Logout(): void {
  api.revoke_token()
  chrome.storage.sync.set({ token: null }, () => {
    UpdateUI()
  })
}

interface ChromeObjT<T> {
  [key: string]: T
}
