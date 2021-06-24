import Migrator from '../core/migrator'

const GENIE = 'https://www.genie.co.kr'
const FILTER = ['TITLE ', '19금 ', '#']
const TITLE_QUERY = '.info__title'
const NEXT_QUERY = '.page-nav .next'

export class G2S extends Migrator {
  bgsq: string = ''

  constructor(bgsq: string) {
    super()
    this.bgsq = bgsq
    this.crawler.nextQuery = NEXT_QUERY
  }

  public async geniePlaylist(bgsq: string, mxnm: string, stoken: string, name?: string, open?: boolean) {
    const url = `${GENIE}/myMusic/profileRecommandDetail?axnm=${mxnm}&bgsq=${bgsq}`
    const queries = ['a.artist', 'a.title']
    const filters = queries.map(() => FILTER)
    super.playlist(url, stoken, queries, filters, TITLE_QUERY, name, open)
  }

  public async likedGenieArtists(bgsq: string, stoken: string): Promise<void> {
    const url = `${GENIE}/myMusic/likeArtist?mltp=artist&bgsq=${bgsq}`
    const queries = ['.artist-name']
    const filters = queries.map(() => FILTER)
    super.likedArtists(url, stoken, queries, filters)
  }

  public async likedGenieAlbums(bgsq: string, stoken: string): Promise<void> {
    const url = `${GENIE}/myMusic/likeAlbum?mltp=album&bgsq=${bgsq}`
    const queries = ['dt.ellipsis', '.album-artist']
    const filters = queries.map(() => FILTER)
    super.likedAlbums(url, stoken, queries, filters)
  }

  public async likedGenieTracks(bgsq: string, stoken: string): Promise<void> {
    const url = `${GENIE}/myMusic/likeSong?mltp=song&bgsq=${bgsq}`
    const queries = ['a.artist', 'a.title']
    const filters = queries.map(() => FILTER)
    super.likedTracks(url, stoken, queries, filters)
  }
}

export default G2S
