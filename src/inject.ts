import { Service } from "./services/service"
import Crunchyroll from "./services/crunchyroll"
import { ErrorLog } from "./utils/logger"

const readyStateInterval = setInterval(() => {
  if (document.readyState === "complete") {
    clearInterval(readyStateInterval)
    setTimeout(() => {
      const service = getCurrentService(window.location.href)
      if (service.CheckValidPage()) {
        service.StartPauseScrobble()
      }
    }, 5000)
  }
}, 100)

function getCurrentService(url: string): Service {
  if (url.includes("crunchyroll")) {
    return new Crunchyroll()
  }
  throw ErrorLog("Invalid URL: " + url)
}
