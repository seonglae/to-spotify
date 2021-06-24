# Genie To Spotify

### 지니에서 스포티파이로 좋아하는 가수, 앨범, 재생목록, 플레이리스트를 옮길 수 있습니다!

<br/>


# Install

### Windows
<img src="https://user-images.githubusercontent.com/27716524/123204750-abd5f780-d4f3-11eb-9698-3190870e55ed.png" width=500>
powershell 을 windows 검색창에 치고 우클릭해서 관리자의 권한으로 실행
### node, npm 설치

```bash
iwr -useb get.scoop.sh | iex
scoop install nodejs
```

### to-sptify 설치
```bash
npm i -g to-spotify
g2s --help
```
### Other OSs
node, npm [설치](https://nodejs.org/ko/download/)하고 위 커맨드를 실행


# Usage
- You need bgsq of yout genie id (your id must be public)
- You nee spotify token from [here](https://developer.spotify.com/console/get-search-item/)

지니뮤직에 들어가서 플레이리스트에 나의 좋아요를 누릅니다
리스트에서 2번째 페이지나 다른 페이지를 클릭합니다
![nav](asset/image/nav.png)

여기 url 에 bgsq=뭐라뭐라 부분을 기억합니다
플레이리스트라면 mxnm도 기억합니다
![gid](asset/image/gid.png)

### Spotify에 인증할 토큰도 발급받아야 하는데
![gis](asset/image/auth.png)
![auth](asset/image/auth.png)


```bash
g2s liked albums --bgsq blablanumber --stoken blablatoolong...
g2s liked tracks --bgsq blablanumber --stoken blablatoolong...
g2s liked artists --bgsq blablanumber --stoken blablatoolong...
g2s playlist --bgsq blablanumber --mxnm blabla --stoken blablatoolong...
```

한글이 포함되어 있는 곡들은 잘 안찾아지는 경향이 있어서 이전 실패 곡들이 리스트들이 곡들이 아래처럼 커맨드창에 뜰텐데
해당 곡들은 직접 넣어야 합니다 ㅠㅠ
![resolve](asset/image/resolve.png)



# 기능
- Migrate Liked Music List
- Migrate Liked Album List
- Migrate Liked Artist List

# Soon
- Playlist Migration
- Melon Support


# Develop

### Local install
```bash
git clone https://github.com/seonglae/to-spotify
npm i -g pnpm
pnpm i
npm uninstall -g to-spotify
pnpm cli
g2s
```
