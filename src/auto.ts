import axios, { AxiosResponse } from 'axios'
import * as rax from 'retry-axios'
import { chromium, Page } from 'playwright'
const consola = require('consola')

const GENIE = 'https://www.genie.co.kr'
const SPOTIFY_API = 'https://api.spotify.com/v1'

type Search = {
  res: Promise<AxiosResponse>
  name: string
  results: Array<any>
}

export class G2S {
  axios = axios.create()

  setAxios(stoken: string) {
    this.axios.defaults.headers.common.Authorization = `Bearer ${stoken}`
    const raxConfig = {
      retryDelay: 1000,
      retry: Infinity,
      instance: this.axios,
    }
    this.axios.defaults.raxConfig = raxConfig
    rax.attach(this.axios)
  }

  public async likeArtist(gid: string, stoken: string): Promise<void> {
    this.setAxios(stoken)

    // Step 1. Crawl Genie Lists
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page: Page = await context.newPage()
    await page.goto(`${GENIE}/myMusic/likeArtist?mltp=artist&bgsq=${gid}`)
    const all = await this.getLists(page, ['.artist-name'])
    await browser.close()

    // Step 2. Search Spotify Artist ids
    const ids = await this.searchByName(all, 'artist')

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/following?type=artist&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 204)) consola.success(`${ids.length} artists followed`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  public async likeAlbums(gid: string, stoken: string): Promise<void> {
    this.setAxios(stoken)

    // Step 1. Crawl Genie Lists
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`${GENIE}/myMusic/likeAlbum?mltp=album&bgsq=${gid}`)
    const all = await this.getLists(page, ['dt.ellipsis', '.album-artist'])
    await browser.close()

    // Step 2. Search Spotify Artist ids
    const ids = await this.searchByName(all, 'album')

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/albums?&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} artists followed`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  public async likeTracks(gid: string, stoken: string): Promise<void> {
    this.setAxios(stoken)

    // Step 1. Crawl Genie Lists
    const browser = await chromium.launch()
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto(`${GENIE}/myMusic/likeSong?mltp=song&bgsq=${gid}`)
    const all = await this.getLists(page, ['a.artist', 'a.title'])
    await browser.close()

    // Step 2. Search Spotify Artist ids
    const ids = await this.searchByName(all, 'track')

    // Step 3. Follow Artists
    const promises = []
    for (const id of ids) promises.push(this.axios.put(`${SPOTIFY_API}/me/tracks?&ids=${id}`))
    const reses = await Promise.all(promises)
    if (reses.every(res => res.status === 200)) consola.success(`${ids.length} artists followed`)
    else consola.error(`Something Wrong with code ${reses[0].status}`)
  }

  async getLists(page: Page, queries: Array<string>) {
    const all: Array<string> = []
    let pg = 1
    while (true) {
      const { lists, href } = await page.evaluate((queries): { href?: string; lists: Array<string> } => {
        const nameSets: Array<Array<string>> = []
        for (const query of queries) {
          const elements: NodeListOf<HTMLElement> = document.querySelectorAll(query)
          elements.forEach((element: HTMLElement, index: number) => {
            const name = element.innerText.replace('19금 ', '').replace('TITLE ', '').replace('#', '')
            if (nameSets[index]) nameSets[index].push(name)
            else nameSets[index] = [name]
          })
        }
        const lists: Array<string> = nameSets.map(nameSet => nameSet.join(' - '))
        const nextBtn = <HTMLAnchorElement>document.querySelectorAll('.page-nav .next')[0]
        return { href: nextBtn.onclick ? undefined : nextBtn.href, lists }
      }, queries)
      all.push(...lists)
      consola.success(`Page ${pg++} Added`)
      if (href) await page.goto(href)
      else break
    }
    consola.info('\nGenie Lists\n')
    console.log(all.join('\n'))
    return all
  }

  async searchByName(all: Array<string>, type: string) {
    const reqs = []
    for (const name of all) {
      const res = this.axios.get(`${SPOTIFY_API}/search?q=${encodeURI(name)}&type=${type}`)
      const search: Search = { res, name, results: [] }
      reqs.push(search)
    }
    const responses = await Promise.all(reqs.map(req => req.res))
    reqs.map((req, i) => (req.results = responses[i].data[`${type}s`].items))

    const faileds = reqs.filter(req => req.results.length === 0).map(req => req.name)
    consola.error(`Not Resolved\n` + faileds.join('\n'))
    return reqs.filter(req => req.results.length !== 0).map(res => res.results[0].id)
  }
}

export default G2S
