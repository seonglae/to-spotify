import Migrator from '../core/migrator'
import Musicface from '../core/musicface'

const GENIE = 'https://www.genie.co.kr'
const FILTER = ['TITLE ', '19금 ', '#']
const TITLE_QUERY = '.info__title'
const NEXT_QUERY = '.page-nav .next'

export class G2S implements Musicface {
  bgsq: string
  mxnm?: string
  migrator: Migrator

  constructor(stoken: string, options: { bgsq: string; mxnm?: string }) {
    this.migrator = new Migrator(stoken, { nextQuery: NEXT_QUERY })
    this.bgsq = options.bgsq
    this.mxnm = options.mxnm
  }

  public async playlist(name?: string, open?: boolean) {
    const url = `${GENIE}/myMusic/profileRecommandDetail?axnm=${this.mxnm}&bgsq=${this.bgsq}`
    const queries = ['a.artist', 'a.title']
    const filters = queries.map(() => FILTER)
    this.migrator.playlist(url, queries, filters, TITLE_QUERY, name, open)
  }

  public async likedArtists(): Promise<void> {
    const url = `${GENIE}/myMusic/likeArtist?mltp=artist&bgsq=${this.bgsq}`
    const queries = ['.artist-name']
    const filters = queries.map(() => FILTER)
    this.migrator.likedArtists(url, queries, filters)
  }

  public async likedAlbums(): Promise<void> {
    const url = `${GENIE}/myMusic/likeAlbum?mltp=album&bgsq=${this.bgsq}`
    const queries = ['dt.ellipsis', '.album-artist']
    const filters = queries.map(() => FILTER)
    this.migrator.likedAlbums(url, queries, filters)
  }

  public async likedTracks(): Promise<void> {
    const url = `${GENIE}/myMusic/likeSong?mltp=song&bgsq=${this.bgsq}`
    const queries = ['a.artist', 'a.title']
    const filters = queries.map(() => FILTER)
    this.migrator.likedTracks(url, queries, filters)
  }
}

export default G2S
