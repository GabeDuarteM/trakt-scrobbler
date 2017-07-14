import Trakt from "trakt.tv"

chrome.storage.sync.set({ access_token: "batata" }, val => {
  console.log("deu boa")
})

chrome.storage.sync.get("access_token", val => {
  if (val.access_token) {
  }
})
