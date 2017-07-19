import * as Trakt from "trakt.tv"

import { IToken } from "../typings/trakt.tv"
import { TraktOptions } from "./utils/constants"
import { ErrorLog } from "./utils/logger"

UpdateUI()
const api = new Trakt(TraktOptions)

function UpdateUI(): void {
  chrome.storage.sync.get("token", (val: IChromeObj<IToken>) => {
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

interface IChromeObj<T> {
  [key: string]: T
}
