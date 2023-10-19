import { r as registerInstance, g as getAssetPath, h, a as Host } from './index-bf3dff48.js';

const cassetteComponentCss = ":host{display:block;height:100%;width:100%;position:relative}:host .content{height:600px;width:555px;position:relative;display:flex}:host .content .item{height:600px;width:555px;position:absolute}:host .content .track{position:absolute;right:45px;top:37px;padding:4px 0;font-size:14px;width:80%;text-align:center;box-shadow:3px 1px grey;background:white;rotate:2deg}:host .content .icons{position:absolute;bottom:68px;left:137px;scale:0.48;display:flex}:host .content .icons .icon{cursor:pointer;border:none;background:none;padding:0;margin:0}:host .cassette{position:absolute;scale:0.68;top:105px;left:66px;overflow:hidden}:host .cassette .line-L{width:140px;height:47px;border-bottom:5px solid #544035;position:absolute;bottom:2px;left:-76px;transform-origin:top right}:host .cassette .line-R{width:125px;height:47px;border-bottom:5px solid #544035;position:absolute;bottom:80px;left:263px;transform-origin:bottom right}:host .cassette.play .disc{animation:play 3s infinite linear forwards}:host .cassette.play .item-L,:host .cassette.play .item-R{transition:rotate 0.3s linear}:host .select{cursor:pointer}:host .items{position:absolute;left:0;top:0;height:283px;width:436px}:host .items .item-L{position:absolute;left:90px;top:85px;transition:rotate 0.1s linear}:host .items .item-R{position:absolute;right:90px;top:85px;transition:rotate 0.1s linear}:host .items .band-L{position:absolute;left:60px;top:60px;width:130px;height:128px}:host .items .band-L .disc{position:absolute;width:100%;height:100%;left:-3px;top:-6px;border-radius:100%;background-color:#544035}:host .items .band-R{position:absolute;left:250px;top:60px;width:130px;height:128px}:host .items .band-R .disc{position:absolute;width:100%;height:100%;left:-3px;top:-6px;border-radius:100%;background-color:#544035}@keyframes play{from{rotate:0deg}to{rotate:360deg}}:host .dragable{position:absolute;top:35px;left:170px;width:50px;height:100px}:host .track-list{position:absolute;width:370px;top:167px;left:459px;background:#f5f5f4;padding:3px}:host .track-list:empty{display:none}:host .track-list .item{margin:2px 0}:host .track-list .item.active{background-color:black;color:white}";

var __asyncValues = (undefined && undefined.__asyncValues) || function (o) {
  if (!Symbol.asyncIterator)
    throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
};
const MyComponent = class {
  constructor(hostRef) {
    registerInstance(this, hostRef);
    this.interval = null;
    this.scale = 1;
    this.status = 'pause';
    this.listAudios = [];
    this.position = 0;
    this.next = 'OFF';
    this.prev = 'OFF';
    this.activeAction = true;
  }
  componentWillLoad() { }
  getLocalAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
      this.status = 'pause';
      this.scale = 1;
    }
    const audioFile = this.listAudios[this.position];
    this.audioElement = new Audio(getAssetPath('./assets/music/' + audioFile));
    this.audioElement.addEventListener('ended', () => {
      this.status = 'pause';
      this.nextAudio();
    });
    this.audioElement.addEventListener('timeupdate', () => {
      const audioPercent = (this.audioElement.currentTime / this.audioElement.duration) * 100;
      this.scale = 1 - audioPercent / 200;
    });
  }
  getAudio() {
    var _a, _b;
    const ctx = new window.AudioContext();
    if ((_a = this.audioElement) === null || _a === void 0 ? void 0 : _a.startTimer) {
      this.pause();
    }
    const data = this.listAudios[this.position];
    const source = ctx.createBufferSource();
    source.buffer = data.decodedBuffer;
    source.connect(ctx.destination);
    source.addEventListener('ended', () => {
      const timeInSound = (new Date().getTime() - this.audioElement.startTimer) / 1000;
      const audioPercent = (timeInSound / this.audioElement.duration) * 100;
      if (audioPercent >= 100) {
        this.nextAudio();
      }
    });
    if (data.name === ((_b = this.audioElement) === null || _b === void 0 ? void 0 : _b.name)) {
      this.audioElement.source = source;
      return;
    }
    this.audioElement = {
      name: data.name,
      source,
      duration: data.decodedBuffer.duration,
    };
  }
  pause() {
    var _a;
    clearInterval(this.interval);
    this.audioElement.currentTime = new Date().getTime() - ((_a = this.audioElement) === null || _a === void 0 ? void 0 : _a.startTimer);
    this.audioElement.source.stop();
    this.status = 'pause';
  }
  play() {
    if (this.status === 'play') {
      return this.pause();
    }
    this.getAudio();
    if (this.audioElement.currentTime) {
      this.audioElement.startTimer = new Date().getTime() - this.audioElement.currentTime;
      this.audioElement.source.start(0, this.audioElement.currentTime / 1000);
    }
    else {
      this.audioElement.startTimer = new Date().getTime();
      this.audioElement.source.start();
    }
    this.interval = setInterval(() => {
      const timeInSound = (new Date().getTime() - this.audioElement.startTimer) / 1000;
      const audioPercent = (timeInSound / this.audioElement.duration) * 100;
      this.scale = 1 - audioPercent / 200;
    }, 100);
    this.status = 'play';
  }
  renderCassette() {
    var _a, _b;
    if (!((_a = this.listAudios) === null || _a === void 0 ? void 0 : _a.length))
      return h("div", { class: 'cassette' });
    return (h("div", { class: 'cassette ' + this.status }, h("img", { class: "main", src: getAssetPath(`./assets/${'cassette.png'}`) }), h("div", { class: "line-L", style: { rotate: `${142 - this.scale * 30}deg` } }), h("div", { class: "line-R", style: { rotate: `${234 - 142 - this.scale * 30}deg` } }), h("div", { class: "items" }, h("div", { class: "band-L" }, h("div", { class: "disc", style: { transform: `scale(${this.scale})` } })), h("div", { class: "band-R" }, h("div", { class: "disc", style: { transform: `scale(${1 - this.scale + 0.5})` } })), h("img", { class: "item-L", style: { rotate: `${this.scale * 360 * 10}deg` }, src: getAssetPath(`./assets/${'item-L.png'}`) }), h("img", { class: "item-R", style: { rotate: `${this.scale * 360 * 10}deg` }, src: getAssetPath(`./assets/${'item-R.png'}`) })), h("div", { class: "track" }, (_b = this.listAudios[this.position]) === null || _b === void 0 ? void 0 : _b.name.replace(/\.[^/.]+$/, ''))));
  }
  renderIcon(type, action) {
    return (h("div", { class: 'icon icon-' + type, onDblClick: () => action.call() }, h("img", { src: getAssetPath(`./assets/${type + '.png'}`) })));
  }
  prevAudio() {
    this.pause();
    this.position--;
    if (this.position < 0) {
      this.position = this.listAudios.length - 1;
    }
    this.play();
  }
  nextAudio() {
    this.pause();
    this.position++;
    if (this.position >= this.listAudios.length) {
      this.position = 0;
    }
    this.play();
  }
  playCassetButtonSound() {
    if (!this.buttonSound) {
      this.buttonSound = new Audio(getAssetPath(`./assets/${'CASSETTE-PLAYER-BUTTON-SOUND-EFFECT.mp3'}`));
      this.buttonSound.volume = 0.3;
    }
    this.buttonSound.play();
  }
  selectFileOrDirectory(ev) {
    if (ev.ctrlKey) {
      this.manageFolders();
    }
    else {
      this.manageFiles();
    }
  }
  async manageFiles() {
    const ctx = new window.AudioContext();
    const handles = await window.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: 'Audio files',
          accept: {
            'audio/*': ['.wav', '.ogg', '.mp3', '.mp4', '.aac', '.flac', '.webm'],
          },
        },
      ],
      excludeAcceptAllOption: true,
    });
    this.activeAction = false;
    let audiosFiles = await Promise.all(handles.map(async (handle) => {
      if (!this.checkFile(handle))
        return;
      const file = await handle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      return {
        name: file.name,
        decodedBuffer,
      };
    }));
    audiosFiles = audiosFiles.filter(item => item);
    if (audiosFiles.length) {
      this.listAudios = [...this.listAudios, ...audiosFiles];
    }
    this.activeAction = true;
  }
  async handleDirectoryEntry(dirHandle, out) {
    var _a, e_1, _b, _c;
    try {
      for (var _d = true, _e = __asyncValues(dirHandle.values()), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
        _c = _f.value;
        _d = false;
        const entry = _c;
        if (entry.kind === 'file') {
          out.push(entry);
        }
        if (entry.kind === 'directory') {
          const newOut = (out[entry.name] = {});
          await this.handleDirectoryEntry(entry, newOut);
        }
      }
    }
    catch (e_1_1) {
      e_1 = { error: e_1_1 };
    }
    finally {
      try {
        if (!_d && !_a && (_b = _e.return))
          await _b.call(_e);
      }
      finally {
        if (e_1)
          throw e_1.error;
      }
    }
  }
  async manageFolders() {
    const ctx = new window.AudioContext();
    const out = [];
    const dirHandle = await window.showDirectoryPicker();
    await this.handleDirectoryEntry(dirHandle, out);
    console.log(out);
    this.activeAction = false;
    let audiosFiles = await Promise.all(out.map(async (handle) => {
      if (!this.checkFile(handle))
        return;
      const file = await handle.getFile();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      return {
        name: file.name,
        decodedBuffer,
      };
    }));
    audiosFiles = audiosFiles.filter(item => item);
    if (audiosFiles.length) {
      this.listAudios = [...this.listAudios, ...audiosFiles];
    }
    this.activeAction = true;
  }
  traverseFileTree(item, path) {
    path = path || '';
    if (!item)
      return;
    if (item.isFile) {
      // Get file
      item.file(function (file) {
        console.log('File:', path + file.name);
      });
    }
    else if (item.isDirectory) {
      // Get folder contents
      var dirReader = item.createReader();
      dirReader.readEntries(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          this.traverseFileTree(entries[i], path + item.name + '/');
        }
      });
    }
  }
  async manageFileToAudioItem(handle) {
    const ctx = new window.AudioContext();
    let file;
    if (!handle)
      return;
    if (handle.isFile) {
      file = await new Promise((resolve, reject) => handle.file(resolve, reject));
      // file = handle.getFile();
    }
    else {
      file = await handle.getAsFile();
    }
    const arrayBuffer = await file.arrayBuffer();
    const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
    console.log('manageFileToAudioItem', {
      name: file.name,
      decodedBuffer,
    });
    return {
      name: file.name,
      decodedBuffer,
    };
  }
  checkFile(file) {
    const extensionOk = ['mp3'];
    return extensionOk.includes(file.name.split('.').pop());
  }
  getEntries(dirReader) {
    return new Promise(resolveOuter => {
      dirReader.readEntries(async (results) => {
        const newData = await Promise.all(results.map(async (result) => {
          // entries = entries.concat(Array(results));
          if (result.isFile) {
            if (this.checkFile(result)) {
              // add item
              return result;
            }
          }
          else if (result.isDirectory) {
            const folderFiles = await this.readDirectory(result);
            return folderFiles;
          }
        }));
        // console.log('getEntries', newData);
        resolveOuter(newData.filter(item => item).flat());
      });
    });
  }
  readDirectory(directory) {
    return new Promise(async (resolveOuter) => {
      let dirReader = directory.createReader();
      const result = await this.getEntries(dirReader);
      resolveOuter(result);
    });
  }
  async manageDropFiles(ev) {
    var _a;
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    if (!((_a = ev.dataTransfer.items) === null || _a === void 0 ? void 0 : _a.length))
      return;
    this.activeAction = false;
    console.log('Start download');
    const allItems = [...ev.dataTransfer.items];
    let audiosFiles = await Promise.all(allItems.map(async (handle) => {
      const item = handle.webkitGetAsEntry();
      if (item) {
        if (item.isFile) {
          return await this.manageFileToAudioItem(handle);
        }
        else if (item.isDirectory) {
          const result = await this.readDirectory(item);
          return await Promise.all(result.map(file => this.manageFileToAudioItem(file)));
        }
      }
    }));
    audiosFiles = audiosFiles.flat().filter(item => item);
    if (audiosFiles.length) {
      this.listAudios = [...this.listAudios, ...audiosFiles];
    }
    console.log('End download');
    this.activeAction = true;
  }
  renderTrackList() {
    return (h("div", { class: "track-list" }, this.listAudios.map(track => {
      var _a;
      return h("div", { class: `item ${((_a = this.listAudios[this.position]) === null || _a === void 0 ? void 0 : _a.name) === (track === null || track === void 0 ? void 0 : track.name) ? 'active' : ''}` }, track === null || track === void 0 ? void 0 : track.name);
    })));
  }
  render() {
    return (h(Host, null, h("div", { class: "content", onDrop: ev => this.manageDropFiles(ev), onDragOver: ev => ev.preventDefault() }, h("img", { class: "item", src: getAssetPath(`./assets/${'EMPTY.png'}`) }), this.renderCassette(), h("img", { class: "item select", src: getAssetPath(`./assets/${'PROTECTION.png'}`), style: { '-webkit-app-region': 'no-drag' }, onClick: ev => this.selectFileOrDirectory(ev) }), h("div", { class: "icons", style: { '-webkit-app-region': 'no-drag' } }, h("button", { disabled: !this.activeAction, class: 'icon', onClick: () => {
        this.prev = 'OFF';
        this.prevAudio();
      }, onMouseDown: () => {
        this.playCassetButtonSound();
        this.prev = 'ON';
      } }, h("img", { src: getAssetPath(`./assets/${`PREV_${this.prev}.png`}`) })), h("button", { disabled: !this.activeAction, class: 'icon', onClick: () => {
        this.play();
      }, onMouseUp: () => {
        this.playCassetButtonSound();
      } }, h("img", { src: getAssetPath(`./assets/${`${this.status.toUpperCase()}.png`}`) })), h("button", { disabled: !this.activeAction, class: 'icon', onClick: () => {
        this.next = 'OFF';
        this.nextAudio();
      }, onMouseDown: () => {
        this.playCassetButtonSound();
        this.next = 'ON';
      } }, h("img", { src: getAssetPath(`./assets/${`NEXT_${this.next}.png`}`) }))), h("div", { class: "dragable", style: { '-webkit-app-region': 'drag' } }))));
  }
  static get assetsDirs() { return ["./assets"]; }
};
MyComponent.style = cassetteComponentCss;

export { MyComponent as cassette_component };

//# sourceMappingURL=cassette-component.entry.js.map