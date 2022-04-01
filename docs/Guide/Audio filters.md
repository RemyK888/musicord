---
name: Audio filters
order: 4
---

# 🎧 Audio filters

Musicord offers a complete system of audio filters. 
About 15 filters are currently available, but this number will increase to 75/100 in the next updates.

## 🔨 Apply an audio filter

It's easy to apply an audio filter to your music.

Here's how to do it. 
First, you need to create a queue, or get one if it already exists.
Then you can apply the filter:

```js
const { AudioFilters } = require('musicord');

queue.setFilter(AudioFilters.rotatingAudio);
```

## 🔧 The 10-band equalizer

Musicord offers an innovative and powerful audio filter: the 10-band equalizer.

Before understanding how it is used, we will explain what an equalizer is (for those who don't know).


![Fabfilter equalizer](https://media.discordapp.net/attachments/801037931195662336/958645474456391710/2022-03-30_10h34_40.png?width=1079&height=671)

The image above is an equalizer developed by [Fabfilter](https://www.fabfilter.com/), it is the [Pro-Q3 model](https://www.fabfilter.com/products/pro-q-3-equalizer-plug-in).

The sound is represented by the grey parts forming waves in the background of the image.

The yellow line represents the equalizer: thus, due to the shape of the yellow line, sound frequencies outside the space delimited by this line will not be heard.

The `customEqualizer()` function is based on the same principle, with one difference: we have divided the sound spectrum into 10 equal parts called 'bands'.

Each of the 10 bands covers the space audible to the human ear, from 20 to 20,000 hertz.

Thus, the argument required for each band represents the percentage of the intensity at which it will be boosted or reduced.

100% will boost that frequency range, while 0 will cancel it out entirely.

Here is an example of how to use the equalizer:

```js
AudioFilters.customEqualizer({
   band1: 99,
   band2: 45,
   band3: 54,
   band4: 53,
   band5: 52,
   band6: 51,
   band7: 50,
   band8: 49,
   band9: 48,
   band10: 47,
});
```

Here we have entered the percentages of each band, however, the function only requires a minimum of one band.

*Note: an audio filter applied while a song is playing will not be applied directly to the current song but to the next one*