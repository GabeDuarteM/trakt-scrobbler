type typeMessage = "INFO" | "WARNING" | "DEBUG"

const traktScrobblerMessage = (type: typeMessage | "ERROR", message: string) => {
  return `Trakt-Scrobbler: [${type}] ${message}`
}

export const Log = (type: typeMessage, message: string): void => {
  const logMessage = traktScrobblerMessage(type, message)

  // tslint:disable-next-line:no-console
  console.log(logMessage)
}

export const ErrorLog = (message: string): Error => {
  return Error(traktScrobblerMessage("ERROR", message))
}
