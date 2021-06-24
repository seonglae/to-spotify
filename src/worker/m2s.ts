import Migrator from '../core/migrator'
import Musicface from '../core/musicface'

const MELON = 'https://www.melon.com'
const FILTER = ['#']
const TITLE_QUERY = '.more_txt_title'
const NEXT_QUERY = '.btn_next'

export class M2S implements Musicface {
  mkey?: string
  pseq?: string
  migrator: Migrator

  constructor(stoken: string, options: { mkey?: string; pseq?: string }) {
    this.migrator = new Migrator(stoken, { nextQuery: NEXT_QUERY })
    this.mkey = options.mkey
    this.pseq = options.pseq
  }

  public async playlist(name?: string, open?: boolean) {
    const url = `${MELON}/mymusic/playlist/mymusicplaylistview_inform.htm?plylstSeq=${this.pseq}`
    const queries = ['.wrapArtistName div a', '.wrap .ellipsis a span']
    const filters = queries.map(() => FILTER)
    this.migrator.playlist(url, queries, filters, TITLE_QUERY, name, open)
  }

  public async likedArtists(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikesong_list.htm?memberKey=${this.mkey}`
    const queries = ['.artist-name']
    const filters = queries.map(() => FILTER)
    this.migrator.likedArtists(url, queries, filters)
  }

  public async likedAlbums(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikealbum_list.htm?memberKey=${this.mkey}`
    const queries = ['dt.ellipsis', '.album-artist']
    const filters = queries.map(() => FILTER)
    this.migrator.likedAlbums(url, queries, filters)
  }

  public async likedTracks(): Promise<void> {
    const url = `${MELON}/mymusic/artistfan/mymusicartistfan_list.htm?memberKey=${this.mkey}`
    const queries = ['a.artist', 'a.title']
    const filters = queries.map(() => FILTER)
    this.migrator.likedTracks(url, queries, filters)
  }
}

export default M2S
