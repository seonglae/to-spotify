# Genie To Spotify

### Spotify Migration Tool from Genie

<br/>

# Feature
- Migrate Liked Music List
- Migrate Liked Album List
- Migrate Liked Artist List

# Install
```
git clone https://github.com/seonglae/genie-to-spotify
npm i -g pnpm
pnpm i
pnpm install
g2s
```


# Usage
- You need bgsq of yout genie id (your id must be public)
- You nee spotify token from [here](https://developer.spotify.com/console/put-following/?type=&ids=)


```bash
g2s liked album --gid=blabla --stoken=blabla
g2s liked song --gid=blabla --stoken=blabla
g2s liked artist --gid=blabla --stoken=blabla
```


# Todo
- Playlist Migration



If you want to migrate playlist, check [here](https://www.clien.net/service/board/lecture/15959548)