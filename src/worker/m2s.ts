import Migrator from '../core/migrator'
import Musicface from '../core/musicface'

const MELON = 'https://www.melon.com'
const FILTERS = ['#']
const TITLE_QUERY = '.more_txt_title'
const NEXT_QUERY = ['.paginate strong+a', '.btn_next']

export class M2S implements Musicface {
  mkey?: string
  pseq?: string
  migrator: Migrator

  constructor(stoken: string, options: { mkey?: string; pseq?: string }) {
    this.migrator = new Migrator(stoken, { nextQueries: NEXT_QUERY })
    this.mkey = options.mkey
    this.pseq = options.pseq
  }

  public async playlist(name?: string, open?: boolean) {
    const url = `${MELON}/mymusic/playlist/mymusicplaylistview_inform.htm?plylstSeq=${this.pseq}`
    const queries = ['.wrapArtistName div a.fc_mgray:first-child', '.wrap .ellipsis a span']
    this.migrator.playlist(url, queries, FILTERS, TITLE_QUERY, name, open)
  }

  public async likedArtists(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikesong_list.htm?memberKey=${this.mkey}`
    const queries = ['.artist-name']
    this.migrator.likedArtists(url, queries, FILTERS)
  }

  public async likedAlbums(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikealbum_list.htm?memberKey=${this.mkey}`
    const queries = ['dt.ellipsis', '.album-artist']
    this.migrator.likedAlbums(url, queries, FILTERS)
  }

  public async likedTracks(): Promise<void> {
    const url = `${MELON}/mymusic/artistfan/mymusicartistfan_list.htm?memberKey=${this.mkey}`
    const queries = ['a.artist', 'a.title']
    this.migrator.likedTracks(url, queries, FILTERS)
  }
}

export default M2S
