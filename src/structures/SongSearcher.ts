import { request } from 'undici';

import { SearchedSong, SearchOptions, Song } from '../utils/Interfaces';
import {
  youTubePattern,
  youTubeBaseURL,
  innerTubeApiURL,
  youTubeVideoURL,
  youTubeChannelURL,
  InnterTubeAndroidContext,
} from '../utils/Constants';

export class SongSearcher {
  private _apikey!: string;
  private _innerTubeContext!: object;
  private _limit = 10;

  /**
   * Search a song
   * @param {string} args
   * @param {SearchOptions} options
   * @returns {Promise<SearchedSong[]>}
   */
  public async search(args: string, options?: SearchOptions): Promise<SearchedSong[]> {
    if (!args || typeof args !== 'string' || youTubePattern.test(args)) throw new TypeError('');
    if (this._apikey === undefined) await this._initInnerTubeApiKey();
    this._limit = options?.maxResults ?? 10;
    const { body } = await request(`${innerTubeApiURL}/search?key=${this._apikey}`, {
      method: 'POST',
      body: JSON.stringify({
        context: this._innerTubeContext,
        query: args,
        type: String(),
      }),
    });
    const returnData: SearchedSong[] = [];
    const jsonData = await body.json();

    for (const content of jsonData.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer
      .contents) {
      if (content.itemSectionRenderer) {
        this._addResults(content.itemSectionRenderer.contents, returnData);
      } else break;
    }
    return returnData;
  }

  /**
   *
   * @param {string} url
   * @returns {Promise<Song>}
   */
  public async extractVideoInfo(url: string): Promise<Song> {
    if (!url || typeof url !== 'string' || !youTubePattern.test(url)) throw new TypeError('');
    if (this._apikey === undefined) await this._initInnerTubeApiKey();
    const { body } = await request(`${innerTubeApiURL}/player?key=${this._apikey}`, {
      method: 'POST',
      body: JSON.stringify(this._generateExtractBody(url)),
    });
    const jsonData = await body.json();
    return {
      id: jsonData.videoDetails.videoId,
      url: `${youTubeVideoURL}${jsonData.videoDetails.videoId}`,
      title: jsonData.videoDetails.title,
      duration: this._humanizeSeconds(Number(jsonData.videoDetails.lengthSeconds)),
      msDuration: Number(jsonData.videoDetails.lengthSeconds) * 1000,
      description: jsonData.videoDetails.shortDescription,
      thumbnails: jsonData.videoDetails.thumbnail.thumbnails,
      channel: {
        id: jsonData.videoDetails.channelId,
        title: jsonData.videoDetails.author,
        url: `${youTubeChannelURL}/${jsonData.videoDetails.channelId}`,
      },
      streamURL: jsonData.streamingData.formats.slice(-1)[0].url,
    };
  }

  /**
   *
   * @param {any[]} results
   * @param {SearchedSong[]} returnData
   * @private
   */
  private _addResults(results: any[], returnData: SearchedSong[]): void {
    for (const data of results) {
      if (returnData.length >= this._limit) break;
      const video = data.videoRenderer;
      if (video) {
        returnData.push({
          type: 'video',
          id: video.videoId,
          url: `${youTubeVideoURL}${video.videoId}`,
          title: video.title.runs[0].text,
          thumbnails: video.thumbnail.thumbnails,
          description: video.detailedMetadataSnippets?.[0].snippetText.runs.map((v: any) => v.text).join(''),
          duration: video.lengthText?.simpleText ?? '0:00',
          msDuration:
            video.lengthText?.simpleText
              .split(':')
              .map(Number)
              .reduce((acc: number, time: number) => 60 * acc + time) * 1000 ?? 0,
          channel: {
            id: video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId,
            url: `${youTubeChannelURL}/${video.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId}`,
            title: video.ownerText.runs[0].text,
            thumbnails: video.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails,
          },
        });
      }
    }
  }

  /**
   * @returns {Promise<void>}
   * @private
   */
  private async _initInnerTubeApiKey(): Promise<void> {
    const { body } = await request(`${youTubeBaseURL}?hl=en`);
    const jsonData = await JSON.parse((/ytcfg.set\(({.+?})\)/s.exec(await body.text()) as RegExpExecArray)[1]);
    this._apikey = jsonData.INNERTUBE_API_KEY;
    this._innerTubeContext = jsonData.INNERTUBE_CONTEXT;
  }

  /**
   *
   * @param {string} url
   * @returns {object}
   * @private
   */
  private _generateExtractBody(url: string): object {
    const videoId = url.match(
      /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\/?\?v=|\/embed\/|\/)([^\s&\?\/\#]+)/,
    )![1];
    return Object.assign(InnterTubeAndroidContext, { videoId });
  }

  /**
   *
   * @param {number} s
   * @returns {string}
   * @private
   */
  private _humanizeSeconds(s: number): string {
    return (s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
  }
}
