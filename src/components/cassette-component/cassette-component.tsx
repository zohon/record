import { Component, Host, State, getAssetPath, h } from '@stencil/core';

@Component({
  tag: 'cassette-component',
  styleUrl: 'cassette-component.scss',
  shadow: true,
  assetsDirs: ['./assets'],
})
export class MyComponent {
  /**
   * The first name
   */
  @State() scale: number = 1;

  @State() status: 'pause' | 'play' = 'pause';
  audioElement: any;

  @State() listAudios = [];

  @State() position = 0;

  componentWillLoad() {}

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
    const ctx = new window.AudioContext();
    if (this.audioElement?.startTimer) {
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

    if (data.name === this.audioElement?.name) {
      this.audioElement.source = source;
      return;
    }

    this.audioElement = {
      name: data.name,
      source,
      duration: data.decodedBuffer.duration,
    };
  }

  interval = null;

  pause() {
    clearInterval(this.interval);
    this.audioElement.currentTime = new Date().getTime() - this.audioElement?.startTimer;
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
    } else {
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
    if (!this.listAudios?.length) return <div class={'cassette'}></div>;

    return (
      <div class={'cassette ' + this.status}>
        <img class="main" src={getAssetPath(`./assets/${'cassette.png'}`)}></img>

        <div class="line-L" style={{ rotate: `${142 - this.scale * 30}deg` }}></div>
        <div class="line-R" style={{ rotate: `${234 - 142 - this.scale * 30}deg` }}></div>

        <div class="items">
          <div class="band-L">
            <div class="disc" style={{ transform: `scale(${this.scale})` }}></div>
          </div>
          <div class="band-R">
            <div class="disc" style={{ transform: `scale(${1 - this.scale + 0.5})` }}></div>
          </div>

          <img class="item-L" style={{ rotate: `${this.scale * 360 * 10}deg` }} src={getAssetPath(`./assets/${'item-L.png'}`)}></img>
          <img class="item-R" style={{ rotate: `${this.scale * 360 * 10}deg` }} src={getAssetPath(`./assets/${'item-R.png'}`)}></img>
        </div>
        <div class="track">{this.listAudios[this.position]?.name.replace(/\.[^/.]+$/, '')}</div>
      </div>
    );
  }

  renderIcon(type: string, action: any) {
    return (
      <div class={'icon icon-' + type} onDblClick={() => action.call()}>
        <img src={getAssetPath(`./assets/${type + '.png'}`)}></img>
      </div>
    );
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

  @State() next = 'OFF';
  @State() prev = 'OFF';

  buttonSound: any;

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
    } else {
      this.manageFiles();
    }
  }

  async manageFiles() {
    const ctx = new window.AudioContext();
    const handles = await (window as any).showOpenFilePicker({
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
    let audiosFiles = await Promise.all(
      handles.map(async handle => {
        if (!this.checkFile(handle)) return;

        const file = await handle.getFile();
        const arrayBuffer = await file.arrayBuffer();
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

        return {
          name: file.name,
          decodedBuffer,
        };
      }),
    );

    audiosFiles = audiosFiles.filter(item => item);

    if (audiosFiles.length) {
      this.listAudios = [...this.listAudios, ...audiosFiles];
    }
    this.activeAction = true;
  }

  async handleDirectoryEntry(dirHandle, out) {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        out.push(entry);
      }
      if (entry.kind === 'directory') {
        const newOut = (out[entry.name] = {});
        await this.handleDirectoryEntry(entry, newOut);
      }
    }
  }

  async manageFolders() {
    const ctx = new window.AudioContext();
    const out = [];
    const dirHandle = await (window as any).showDirectoryPicker();
    await this.handleDirectoryEntry(dirHandle, out);
    console.log(out);

    this.activeAction = false;
    let audiosFiles = await Promise.all(
      out.map(async handle => {
        if (!this.checkFile(handle)) return;

        const file = await handle.getFile();
        const arrayBuffer = await file.arrayBuffer();
        const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);

        return {
          name: file.name,
          decodedBuffer,
        };
      }),
    );

    audiosFiles = audiosFiles.filter(item => item);

    if (audiosFiles.length) {
      this.listAudios = [...this.listAudios, ...audiosFiles];
    }
    this.activeAction = true;
  }

  traverseFileTree(item, path) {
    path = path || '';
    if (!item) return;
    if (item.isFile) {
      // Get file
      item.file(function (file) {
        console.log('File:', path + file.name);
      });
    } else if (item.isDirectory) {
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
    if (!handle) return;
    if (handle.isFile) {
      file = await new Promise((resolve, reject) => handle.file(resolve, reject));
      // file = handle.getFile();
    } else {
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
      dirReader.readEntries(async results => {
        const newData = await Promise.all(
          results.map(async (result: any) => {
            // entries = entries.concat(Array(results));
            if (result.isFile) {
              if (this.checkFile(result)) {
                // add item
                return result;
              }
            } else if (result.isDirectory) {
              const folderFiles = await this.readDirectory(result);
              return folderFiles;
            }
          }),
        );
        // console.log('getEntries', newData);
        resolveOuter(newData.filter(item => item).flat());
      });
    });
  }

  readDirectory(directory) {
    return new Promise(async resolveOuter => {
      let dirReader = directory.createReader();
      const result = await this.getEntries(dirReader);
      resolveOuter(result);
    });
  }

  @State() activeAction = true;

  async manageDropFiles(ev) {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    if (!ev.dataTransfer.items?.length) return;

    this.activeAction = false;
    console.log('Start download');
    const allItems = [...ev.dataTransfer.items];

    let audiosFiles = await Promise.all(
      allItems.map(async handle => {
        const item = handle.webkitGetAsEntry();
        if (item) {
          if (item.isFile) {
            return await this.manageFileToAudioItem(handle);
          } else if (item.isDirectory) {
            const result = await this.readDirectory(item);
            return await Promise.all((result as any).map(file => this.manageFileToAudioItem(file)));
          }
        }
      }),
    );

    audiosFiles = audiosFiles.flat().filter(item => item);

    if (audiosFiles.length) {
      this.listAudios = [...this.listAudios, ...audiosFiles];
    }
    console.log('End download');

    this.activeAction = true;
  }

  renderTrackList() {
    return (
      <div class="track-list">
        {this.listAudios.map(track => {
          return <div class={`item ${this.listAudios[this.position]?.name === track?.name ? 'active' : ''}`}>{track?.name}</div>;
        })}
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div class="content" onDrop={ev => this.manageDropFiles(ev)} onDragOver={ev => ev.preventDefault()}>
          <img class="item" src={getAssetPath(`./assets/${'EMPTY.png'}`)}></img>

          {this.renderCassette()}

          <img class="item select" src={getAssetPath(`./assets/${'PROTECTION.png'}`)} style={{ '-webkit-app-region': 'no-drag' }} onClick={ev => this.selectFileOrDirectory(ev)}></img>

          <div class="icons" style={{ '-webkit-app-region': 'no-drag' }}>
            <button
              disabled={!this.activeAction}
              class={'icon'}
              onClick={() => {
                this.prev = 'OFF';
                this.prevAudio();
              }}
              onMouseDown={() => {
                this.playCassetButtonSound();
                this.prev = 'ON';
              }}
            >
              <img src={getAssetPath(`./assets/${`PREV_${this.prev}.png`}`)}></img>
            </button>

            <button
              disabled={!this.activeAction}
              class={'icon'}
              onClick={() => {
                this.play();
              }}
              onMouseUp={() => {
                this.playCassetButtonSound();
              }}
            >
              <img src={getAssetPath(`./assets/${`${this.status.toUpperCase()}.png`}`)}></img>
            </button>

            <button
              disabled={!this.activeAction}
              class={'icon'}
              onClick={() => {
                this.next = 'OFF';
                this.nextAudio();
              }}
              onMouseDown={() => {
                this.playCassetButtonSound();
                this.next = 'ON';
              }}
            >
              <img src={getAssetPath(`./assets/${`NEXT_${this.next}.png`}`)}></img>
            </button>
          </div>
          <div class="dragable" style={{ '-webkit-app-region': 'drag' }}></div>
        </div>

        {/* {this.renderTrackList()} */}
      </Host>
    );
  }
}
