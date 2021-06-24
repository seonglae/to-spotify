import axios, { AxiosResponse, AxiosError, AxiosInstance } from 'axios'
import * as rax from 'retry-axios'

const consola = require('consola')

const SPOTIFY_API = 'https://api.spotify.com/v1'

type Search = {
  res: Promise<AxiosResponse>
  name: string
  results: Array<any>
}

export class Spotifier {
  axios: AxiosInstance = axios.create()
  nextQuery: string = ''

  async nameToSpotifyId(all: Array<string>, type: string): Promise<Array<string>> {
    const reqs = []
    for (const name of all) {
      const res = this.axios.get(`${SPOTIFY_API}/search?q=${encodeURI(name)}&type=${type}`).catch(err => err.response)
      const search: Search = { res, name, results: [] }
      reqs.push(search)
    }
    const responses = await Promise.all(reqs.map(req => req.res))
    if (responses.every(res => res.status === 401)) {
      consola.error('Token Expired!')
      return []
    }
    reqs.map((req, i) => (req.results = responses[i].data[`${type}s`].items))

    const faileds = reqs.filter(req => req.results.length === 0).map(req => req.name)
    consola.error(`Not Resolved\n` + faileds.join('\n'))
    return reqs.filter(req => req.results.length !== 0).map(res => res.results[0].id)
  }

  setAxios(stoken: string) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${stoken}`
    const raxConfig = {
      retryDelay: 1000,
      retry: Infinity,
      instance: this.axios,
      onRetryAttempt: (err: AxiosError) => {
        if (err.response?.status !== 429) console.log(err.response)
      },
    }
    this.axios.defaults.raxConfig = raxConfig
    this.axios.defaults.raxConfig.backoffType = 'linear'
    rax.attach(this.axios)
  }
}

export default Spotifier
