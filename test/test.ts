
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
  async function coucou() { 
      console.log(decodeURI("https://rr2---sn-cv0tb0xn-hgnl.googlevideo.com/videoplayback%3Fexpire%3D1646783606%26ei%3DFpgnYtvCH8KvW8b9p4AJ%26ip%3D176.158.66.94%26id%3Do-ANIJI2kdG2ddS3u-qyjs6F00h_lFzvrLO-qw1P9tHPUW%26itag%3D18%26source%3Dyoutube%26requiressl%3Dyes%26mh%3DxK%26mm%3D31%252C29%26mn%3Dsn-cv0tb0xn-hgnl%252Csn-hgn7yn7e%26ms%3Dau%252Crdu%26mv%3Dm%26mvi%3D2%26pl%3D19%26gcr%3Dfr%26initcwndbps%3D1141250%26spc%3D4ocVC14Ng_lLSCoH6tkZ-_g4DLMytBnnj8w576Wlvg%26vprv%3D1%26mime%3Dvideo%252Fmp4%26ns%3DahZCNL3cYNjpTOLH0FBiPAwG%26gir%3Dyes%26clen%3D3809863%26ratebypass%3Dyes%26dur%3D215.132%26lmt%3D1638190387555515%26mt%3D1646761776%26fvip%3D2%26fexp%3D24001373%252C24007246%26c%3DWEB%26txp%3D5530434%26n%3DlhHSuBYdpxMa5_zqg51-%26sparams%3Dexpire%252Cei%252Cip%252Cid%252Citag%252Csource%252Crequiressl%252Cgcr%252Cspc%252Cvprv%252Cmime%252Cns%252Cgir%252Cclen%252Cratebypass%252Cdur%252Clmt%26lsparams%3Dmh%252Cmm%252Cmn%252Cms%252Cmv%252Cmvi%252Cpl%252Cinitcwndbps%26lsig%3DAG3C_xAwRQIgcNa317Rqi32YBKIgLF3jMt2DikxJd1dNm3GX4EUsDvsCIQCoXVTUy1myk8fqel-SbNzhkyrAeEqyiLxSoFM2OMhroQ%253D%253D"))
        //.then(text => console.log(text));
    } 

    coucou()