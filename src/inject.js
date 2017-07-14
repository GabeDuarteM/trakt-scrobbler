import Crunchyroll from "./services/crunchyroll"
import Log from "./utils/logger"

chrome.extension.sendMessage({}, function(response) {
  var readyStateInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateInterval)
      const service = getCurrentService(window.location.href)
      if (service.checkValidPage()) {
        service.startScrobble()
      }
    }
  }, 10)
})

function getCurrentService(url) {
  if (url.includes("crunchyroll")) {
    return new Crunchyroll()
  }
  Log("error", "invalid URL: " + url)
}
