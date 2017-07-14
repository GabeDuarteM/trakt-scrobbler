export default (type, message) => {
  const logMessage = `Trakt-Scrobbler: [${type.toUpperCase()}] ${message}`

  console.log(logMessage)
}
