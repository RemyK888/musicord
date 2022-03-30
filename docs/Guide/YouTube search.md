---
name: YouTube search
order: 3
---

# 🎧 YouTube search

Musicord offers an innovative YouTube search system that does not use an external library.
No API key is required

## ▶️ Video

In order to search for videos on YouTube, you can use the `search()` function, which is built right into the `SongSearcher`.

Here is an example of how to use it:

```js
const { SongSearcher } = require('musicord');

const songSearcher = new SongSearcher();

(async () => {
    const searchedSongs = await songSearcher.search('search term', {
        maxResults: 10
    });
    console.log(searchedSongs);
})();
```

This function will return an array of videos searched on YouTube: 

```
type: 'video' | 'playlist';
id: string;
url: string;
title: string;
thumbnails: {
      url: string;
      width: number;
      height: number;
  }[],
description: string;
duration: string;
msDuration: number;
channel: {
  id: string;
  url: string;
  title: string;
  thumbnails: {
      url: string;
      width: number;
      height: number;
  }[]
};
```

For example, if you want to get the url of the 2nd result, you just have to use :

```js
console.log(searchedSongs[0].url);
```

## ⏸️ Playlist

Musicord does not offer a YouTube playlist search system for API reasons, but you can still use the `fetchPlaylist()` function to fetch up to the first 100 videos of a playlist/mixtape.

Here is a small example of how to use it:

```js
const { SongSearcher } = require('musicord');

const songSearcher = new SongSearcher();

(async () => {
    const searchedPlaylist = await songSearcher.fetchPlaylist('playlist/mixtape URL');
    console.log(searchedPlaylist[0]);
})();
```

You will then get the first video of the playlist, which will look like this:

```
title: string;
videoId: string;
index: number;
isPlayable: boolean;
url: string;
```

## ⚠️ Warning

This system is still under development.
Although normally functional, you may encounter some errors, please let us know as soon as possible by joining our [Discord server](https://discord.gg/UBUSgw4).

A Spotify search system will be added in a future release (a Spotify API key will be required to access the API).