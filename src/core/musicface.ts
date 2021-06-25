interface Musicface {
  playlist: (...args: any[]) => Promise<void>
  likedTracks: (...args: any[]) => Promise<void>
  likedAlbums: (...args: any[]) => Promise<void>
  likedArtists: (...args: any[]) => Promise<void>
}

export default Musicface
