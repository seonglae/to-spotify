import Spotifier from './spotifier'
import Crawler from './crawler'
import Musicface from './musicface'
export class Migrator implements Musicface {
  spotifier: Spotifier
  crawler: Crawler

  constructor(stoken: string, options: { nextQueries: Array<string> }) {
    this.spotifier = new Spotifier(stoken)
    this.crawler = new Crawler(options)
  }

  public async playlist(
    url: string,
    queries: Array<string>,
    filters: Array<string>,
    titleQuery: string,
    name?: string,
    open?: boolean
  ) {
    // Step 1. Crawl Lists
    const { page, browser } = await this.crawler.goToPage(url)
    const all = await this.crawler.getList(page, queries, filters)
    const title = await this.crawler.getQueryText(page, titleQuery)
    await browser.close()
    this.spotifier.playlist(all, title, name, open)
  }

  public async likedArtists(url: string, queries: Array<string>, filters: Array<string>, fast?: boolean): Promise<void> {
    // Step 1. Crawl Lists
    const { page, browser } = await this.crawler.goToPage(url)
    const all = await this.crawler.getList(page, queries, filters, fast)
    await browser.close()
    this.spotifier.likedArtists(all)
  }

  public async likedAlbums(url: string, queries: Array<string>, filters: Array<string>, fast?: boolean): Promise<void> {
    // Step 1. Crawl Lists
    const { page, browser } = await this.crawler.goToPage(url)
    const all = await this.crawler.getList(page, queries, filters, fast)
    await browser.close()
    this.spotifier.likedAlbums(all)
  }

  public async likedTracks(url: string, queries: Array<string>, filters: Array<string>, fast?: boolean): Promise<void> {
    const { page, browser } = await this.crawler.goToPage(url)
    // Step 1. Crawl Lists
    const all = await this.crawler.getList(page, queries, filters, fast)
    await browser.close()
    this.spotifier.likedTracks(all)
  }
}

export default Migrator
