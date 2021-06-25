import Migrator from '../core/migrator'
import Musicface from '../core/musicface'

const MELON = 'https://www.melon.com'
const FILTERS = ['#', ' 상세정보 페이지 이동', '?', "&"]
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
    const url = `${MELON}/mymusic/artistfan/mymusicartistfan_list.htm?memberKey=${this.mkey}`
    const queries = ['dl dt a']
    this.migrator.likedArtists(url, queries, FILTERS, true)
  }

  public async likedAlbums(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikealbum_list.htm?memberKey=${this.mkey}`
    const queries = ['.checkEllipsis', 'dl dt a']
    this.migrator.likedAlbums(url, queries, FILTERS, true)
  }

  public async likedTracks(): Promise<void> {
    const url = `${MELON}/mymusic/like/mymusiclikesong_list.htm?memberKey=${this.mkey}`
    const queries = ['.checkEllipsis', '.wrap .ellipsis a span']
    this.migrator.likedTracks(url, queries, FILTERS, true)
  }
}

export default M2S
