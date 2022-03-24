/*
interface IterateNum {
    [Symbol.iterator](): IterableIterator<any>;
  }
  
  class Collection implements IterateNum {
      private items = [{ bassboost: 'dfgdfg'}, { '8D': 'gfhdfghjjh' }]; // can be Array<T>
  
      constructor() {}
  
      *[Symbol.iterator]() {
          for(let i of this.items) {
              yield i;
          }
      }
  }
  
  for(let n of (new Collection())) {
      console.log(n);
  }


  import { download, search, getVideoInfo } from 'youtube-dlsr';
  import { createWriteStream } from 'fs';
  
  (async () => {
      // Search video.
      const result = await search('retail therapy central cee', { type: 'video', limit: 1 });
      const video = (await getVideoInfo(result[0].url)).normalFormats.slice(-1)[0].url
    console.log(video)
  })();
  

//import fetch from 'node-fetch';

const body = {
    context: {
        /*client: {
            hl: "en", 
            gl: "US", 
            visitorData: "CgtaY3FJcE40cmZjMCj5iuL-BQ%3D%3D", 
            userAgent: "gzip(gfe)", 
            clientName: "WEB_EMBEDDED_PLAYER", 
            clientVersion: "20201212" 
        },
        client: {
            hl: 'en',
            gl: 'US',
            clientName: 'ANDROID',
            clientVersion: '17.07.35',
            utcOffsetMinutes: 0
        },
        user: {},
        request: {}
    },
    videoId: 'O4v1Mwyg-GM'
};


import { request } from 'undici';


(async () => {
    const { body } = await request('https://www.youtube.com/youtubei/v1/player?key=AIzaSyCjc_pVEDi4qsv5MtC2dMXzpIaDoRFLsxw', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
    });
    const data = await response.json();
    //console.log(data)
    console.log(data.streamingData.formats.slice(-1)[0].url); 

    const { body } = await request('https://www.youtube.com?hl=en');
    const jsonData = JSON.parse((/ytcfg.set\(({.+?})\)/s.exec(await body.text()) as RegExpExecArray)[1]);

    console.log(jsonData);
})();


import { audioPattern } from '../src/utils/Constants';

console.log(audioPattern.test('http://ccmixter.org/content/Lav/Lav_-_dark_quiet_night_(war_in_europe_2022_edition).mp3'))

*/


