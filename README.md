# Genie To Spotify

### 지니에서 스포티파이로 좋아하는 가수, 앨범, 재생목록, 플레이리스트를 옮길 수 있습니다!

<br/>


# Install
```
npm i -g to-spotify
g2s --help
```

# Usage
- You need bgsq of yout genie id (your id must be public)
- You nee spotify token from [here](https://developer.spotify.com/console/put-following/?type=&ids=)

지니뮤직에 들어가서 플레이리스트에 나의 좋아요를 누릅니다
리스트에서 2번째 페이지나 다른 페이지를 클릭합니다
![gis](asset/image/nav.png)

여기 url 에 bgsq=뭐라뭐라 부분을 기억합니다
플레이리스트라면 mxnm도 기억합니다
![gis](asset/image/gid.png)

### Spotify에 인증할 토큰도 발급받아야 하는데
![gis](asset/image/stoken.png)
![gis](asset/image/auth.png)


```bash
g2s like album --gid=blablanumber --stoken=blablatoolong...
g2s like track --gid=blablanumber --stoken=blablatoolong...
g2s like artist --gid=blablanumber --stoken=blablatoolong...
```

한글이 포함되어 있는 곡들은 잘 안찾아지는 경향이 있어서 이전 실패 곡들이 리스트들이 곡들이 커맨드창에 뜰텐데
해당 곡들은 직접 넣어야 합니다 ㅠㅠ


# 기능
- Migrate Liked Music List
- Migrate Liked Album List
- Migrate Liked Artist List

# Soon
- Playlist Migration
- Melon Support
