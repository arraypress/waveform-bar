<div align="center">

# WaveformBar

**A persistent bottom audio player bar for any website.**
Built on WaveformPlayer — site-wide playback with queue management, favorites, cart integration, DJ mode, and session persistence.

![npm version](https://img.shields.io/npm/v/@arraypress/waveform-bar?style=flat-square&labelColor=09090b&color=3f3f46)
![gzip](https://img.shields.io/bundlephobia/minzip/@arraypress/waveform-bar?style=flat-square&label=gzip&labelColor=09090b&color=3f3f46)
![license](https://img.shields.io/npm/l/@arraypress/waveform-bar?style=flat-square&labelColor=09090b&color=3f3f46)

**[Documentation](https://docs.waveformplayer.com/)** · [npm](https://www.npmjs.com/package/@arraypress/waveform-bar)

</div>

---

## Install

```bash
npm install @arraypress/waveform-player @arraypress/waveform-bar
```

```html
<!-- WaveformPlayer must load first -->
<link rel="stylesheet" href="https://unpkg.com/@arraypress/waveform-player/dist/waveform-player.css">
<script src="https://unpkg.com/@arraypress/waveform-player/dist/waveform-player.js"></script>

<!-- Then WaveformBar -->
<link rel="stylesheet" href="https://unpkg.com/@arraypress/waveform-bar/dist/waveform-bar.css">
<script src="https://unpkg.com/@arraypress/waveform-bar/dist/waveform-bar.js"></script>

<button data-wb-play
        data-url="song.mp3"
        data-title="My Song"
        data-artist="Artist Name">
    Play
</button>

<script>
    WaveformBar.init({ continuous: true });
</script>
```

## Documentation

Full configuration, triggers, theming, and API reference live in the docs.

### -> [docs.waveformplayer.com](https://docs.waveformplayer.com/)

[Configuration](https://docs.waveformplayer.com/extensions/bar/configuration/) · [Features](https://docs.waveformplayer.com/extensions/bar/features/) · [Triggers](https://docs.waveformplayer.com/extensions/bar/triggers/) · [Theming](https://docs.waveformplayer.com/extensions/bar/theming/) · [API](https://docs.waveformplayer.com/extensions/bar/api/)

## License

MIT © [ArrayPress](https://github.com/arraypress)
