
const youtubeTester = new RegExp(/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\\_]*)(&(amp;)?‌​[\w\\?‌​=]*)?/g);

export class SongExtractor {
    constructor() {

    }

    /**
     * getMp3Url
     */
    public getMp3URL(link: string): string {
        if(!link || youtubeTester.test(link) == false) throw new Error('Pas valide !!!')

        
        return ''
    }
    


}

const extractor = new SongExtractor()

console.log( extractor.getMp3URL('https://youtu.be/O4v1Mwyg-GM'))
