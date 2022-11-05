<template>
  <div class="zoombar-container-center">
    <div class="zoombar-container">
      <img
        class="zoom-button"
        @click="manualZoom(1)"
        src="@/assets/svg/zoom-in.svg"
        alt="zoom-in"
      />
      <img
        class="zoom-button"
        @click="manualZoom(-1)"
        src="@/assets/svg/zoom-out.svg"
        alt="zoom-out"
      />
      <img
        class="zoom-button"
        @click="focus($store.state.player.playedKnotId)"
        src="@/assets/svg/locate.svg"
        alt="focus-playing"
      />
      <img
        class="zoom-button"
        @click="focus('ALL')"
        src="@/assets/svg/full-zoom.svg"
        alt="focus-all"
      />
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    manualZoom(diff) {
      this.$store.commit('ui/PUSH_ZOOM_QUEUE', diff)
    },
    focus(target) {
      this.$store.dispatch('map/focus', target)
    },
  },
}
</script>

<style lang="scss" scoped>
.zoombar-container-center {
  position: absolute;
  right: 0px;
  height: 100%;
  margin-right: 15px;
  padding-bottom: 15px + $navbar-height + 30px;
  pointer-events: none;

  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.zoombar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  border-radius: 5px;
}

.zoombar-container > img {
  padding: 10px;
  width: 50px;
  height: 50px;
  pointer-events: auto;
  cursor: pointer;
}

.zoombar-container > img:hover {
  backdrop-filter: brightness(90%);
  transition: backdrop-filter 100ms;
}

.zoom-button {
  width: 40px;
  height: 40px;
}
</style>
