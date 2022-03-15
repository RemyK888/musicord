export const youTubePattern: RegExp = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/;

export const youTubeBaseURL = 'https://www.youtube.com';
export const innerTubeApiURL = 'https://www.youtube.com/youtubei/v1';
export const youTubeVideoURL = 'https://www.youtube.com/watch?v=';
export const youTubeChannelURL = 'https://www.youtube.com/channel';
export const youTubePlaylistURL = 'https://www.youtube.com/playlist';

export const InnterTubeAndroidContext = {
  context: {
    client: {
      hl: 'en',
      gl: 'US',
      clientName: 'ANDROID',
      clientVersion: '17.09.33',
      utcOffsetMinutes: 0,
    },
    user: {},
    request: {},
  },
};
