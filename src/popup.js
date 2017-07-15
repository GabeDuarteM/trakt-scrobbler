import Trakt from "trakt.tv"
import { TraktOptions } from "./utils/constants"

UpdateUI()
const api = new Trakt(TraktOptions)

function UpdateUI() {
  chrome.storage.sync.get("token", val => {
    const btn = document.querySelector("#btn-auth")

    if (val.token && val.token.access_token) {
      btn.classList.add("logout")
      btn.classList.remove("login")
      btn.text = "Logout"
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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  )

  console.log(request)
})

function Logout() {
  api.revoke_token()
  chrome.storage.sync.set({ token: null }, val => {
    UpdateUI()
  })
}
