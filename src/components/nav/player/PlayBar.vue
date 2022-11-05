<template>
  <div class="playbar-container">
    <div class="playbar-fill" :style="fillStyle"></div>
    <div class="playbar-text-group">
      <span class="playbar-timestamp noselect">{{ timeStamp }}</span>
      <div class="playbar-title-wrapper">
        <!-- <span class="playbar-title noselect">
          {{
            ((track && track.artist) || '') +
              ' - ' +
              ((track && track.title) || '')
          }}
        </span> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      posLoopId: null,
      localOffset: 0,
      lastRemotePos: 0,
    }
  },
  mounted() {
    this.$el.addEventListener('click', this.seekOnClick)
  },
  computed: {
    ...mapState('player', ['status', 'position', 'duration', 'sdk', 'track']),
    timeStamp() {
      const posMin = Math.floor(this.localPos / 60000)
      const posSec = Math.floor((this.localPos % 60000) / 1000)
      const durMin = Math.floor(this.duration / 60000)
      const durSec = Math.floor((this.duration % 60000) / 1000)
      return `${posMin}:${(posSec < 10 ? '0' : '') +
        posSec} / ${durMin}:${(durSec < 10 ? '0' : '') + durSec}`
    },
    localPos() {
      return this.position + this.localOffset
    },
    fillStyle() {
      const width = this.$el ? this.$el.clientWidth : 0

      let pxProgress
      if (this.duration === 0) {
        pxProgress = 0
      } else {
        pxProgress = Math.min(
          Math.floor((this.localPos / this.duration) * width),
          width,
        )
      }
      return {
        width: `${pxProgress}px`,
      }
    },
  },
  methods: {
    seekOnClick(event) {
      const width = this.$el.clientWidth
      if (width <= 0) return

      const pxPos = event.clientX - this.$el.getBoundingClientRect().left
      if (pxPos < 0) return

      const msPos = Math.floor(Math.min(pxPos / width, 1) * this.duration)
      this.sdk.seek(msPos)
    },
    posLoop() {
      this.posLoopId = setTimeout(() => {
        this.localOffset += 500
        this.posLoop()
      }, 500)
    },
  },
  watch: {
    status: function(val) {
      if (val !== 'PLAYING') {
        clearTimeout(this.posLoopId)
        this.localOffset = 0
      } else {
        this.posLoop()
      }
    },
    position: function() {
      // this.lastRemotePos = val
      this.localOffset = 0
    },
  },
}
</script>

<style lang="scss" scoped>
.playbar-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
}

.playbar-fill {
  height: 100%;
  background-color: $black;
}

.playbar-text-group {
  position: absolute;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0px 10px 0px 10px;
}

.playbar-timestamp,
.playbar-title {
  color: white;
  mix-blend-mode: unset;

  white-space: nowrap;
}

// .playbar-timestamp {
// height: 100%;
// display: flex;
// align-items: center;
// background-color: $bg-primary;
// }

.playbar-title-wrapper {
  max-width: 80%;
  overflow: hidden;
}

.playbar-title {
  display: inline-block;
  // animation: marquee 40s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }
  20% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, 0);
  }
}
</style>
