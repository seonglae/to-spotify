import Migrator from '../core/migrator'

const MELON = 'https://www.melon.com'
const FILTER = ['#']
const TITLE_QUERY = '.more_txt_title'
const NEXT_QUERY = '.btn_next'

export class M2S extends Migrator {
  mkey?: string
  pseq?: string

  constructor(stoken: string, options: { mkey?: string; pseq?: string }) {
    super(stoken, { nextQuery: NEXT_QUERY })
    this.mkey = options.mkey
    this.pseq = options.pseq
  }

  public async melonPlaylist(name?: string, open?: boolean) {
    const url = `${MELON}/mymusic/playlist/mymusicplaylistview_inform.htm?plylstSeq=${this.pseq}`
    const queries = ['.wrapArtistName div a', '.wrap .ellipsis a span']
    const filters = queries.map(() => FILTER)
    super.playlist(url, queries, filters, TITLE_QUERY, name, open)
  }

  public async likedMelonArtists(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikesong_list.htm?memberKey=${this.mkey}`
    const queries = ['.artist-name']
    const filters = queries.map(() => FILTER)
    super.likedArtists(url, queries, filters)
  }

  public async likedMelonAlbums(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikealbum_list.htm?memberKey=${this.mkey}`
    const queries = ['dt.ellipsis', '.album-artist']
    const filters = queries.map(() => FILTER)
    super.likedAlbums(url, queries, filters)
  }

  public async likedMelonTracks(): Promise<void> {
    const url = `${MELON}/mymusic/artistfan/mymusicartistfan_list.htm?memberKey=${this.mkey}`
    const queries = ['a.artist', 'a.title']
    const filters = queries.map(() => FILTER)
    super.likedTracks(url, queries, filters)
  }
}

export default M2S
