const consola = require('consola')

export class G2S {
  /**
   * @example
   * ```ts
   * basher.run()
   * ```
   * @return {Promise<void>}
   */
  public async run(): Promise<void> {
    consola.info('run')
  }
}

export default G2S
