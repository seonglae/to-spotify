const consola = require('consola')

namespace Auto {
  export class Basher {
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
}

export default Auto
