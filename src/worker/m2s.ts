import Migrator from '../core/migrator'

const MELON = 'https://www.melon.com'
const FILTER = ['#']
const TITLE_QUERY = '.more_txt_title'
const NEXT_QUERY = '.btn_next'

export class M2S extends Migrator {
  constructor() {
    super()
    this.crawler.nextQuery = NEXT_QUERY
  }

  public async melonPlaylist(pid: string, stoken: string, name?: string, open?: boolean) {
    const url = `${MELON}/mymusic/playlist/mymusicplaylistview_inform.htm?plylstSeq=${pid}`
    const queries = ['.wrapArtistName div a', '.wrap .ellipsis a span']
    const filters = queries.map(() => FILTER)
    super.playlist(url, stoken, queries, filters, TITLE_QUERY, name, open)
  }

  public async likedMelonArtists(mid: string, stoken: string): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikesong_list.htm?memberKey=${mid}`
    const queries = ['.artist-name']
    const filters = queries.map(() => FILTER)
    super.likedArtists(url, stoken, queries, filters)
  }

  public async likedMelonAlbums(mid: string, stoken: string): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikealbum_list.htm?memberKey=${mid}`
    const queries = ['dt.ellipsis', '.album-artist']
    const filters = queries.map(() => FILTER)
    super.likedAlbums(url, stoken, queries, filters)
  }

  public async likedMelonTracks(mid: string, stoken: string): Promise<void> {
    const url = `${MELON}/mymusic/artistfan/mymusicartistfan_list.htm?memberKey=${mid}`
    const queries = ['a.artist', 'a.title']
    const filters = queries.map(() => FILTER)
    super.likedTracks(url, stoken, queries, filters)
  }
}

export default M2S
