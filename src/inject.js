import Crunchyroll from "./services/crunchyroll"
import Log from "./utils/logger"

var readyStateInterval = setInterval(function() {
  if (document.readyState === "complete") {
    clearInterval(readyStateInterval)
    const service = getCurrentService(window.location.href)
    if (service.CheckValidPage()) {
      service.StartScrobble()
    }
  }
}, 10)

function getCurrentService(url) {
  if (url.includes("crunchyroll")) {
    return new Crunchyroll()
  }
  Log("error", "invalid URL: " + url)
}
