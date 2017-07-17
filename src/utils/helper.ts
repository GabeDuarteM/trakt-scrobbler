export async function sleep(ms: number): Promise<void> {
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
