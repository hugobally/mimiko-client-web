<template>
  <div
    class="panel-centerer"
    @click="closePanelOutsideClick"
    ref="panelCenterer"
  >
    <div class="panel-container">
      <img
        @click="closePanel"
        class="close-icon"
        src="@/assets/svg/close-icon.svg"
        alt="close-icon"
      />
      <div class="panel-header">
        <!--        <h1 class="panel-title noselect">{{ titleStr }}</h1>-->
      </div>
      <div class="panel-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      kbListener: null,
    }
  },
  mounted() {
    const onKeyUp = (e) => {
      this.kbHandler(e)
    }
    window.addEventListener('keyup', onKeyUp)
    this.kbListener = onKeyUp
  },
  destroyed() {
    window.removeEventListener('keyup', this.kbListener)
  },
  computed: {
    titleStr() {
      const str = this.$route.hash.slice(1).replace('-', ' ')
      return str.charAt(0).toUpperCase() + str.slice(1)
    },
  },
  methods: {
    kbHandler(e) {
      if (e.key === 'Escape') this.closePanel()
    },
    closePanel(e) {
      this.$router.replace({
        path: this.$route.path,
        hash: '',
        query: this.$route.query,
      })
    },
    closePanelOutsideClick(e) {
      if (e.target !== this.$refs.panelCenterer) return

      this.closePanel()
    },
  },
}
</script>

<style lang="scss" scoped>
.panel-centerer {
  position: fixed;
  display: flex;

  height: calc(100% - #{$navbar-height});
  width: 100%;

  align-items: center;
  flex-direction: column;
}

.panel-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;

  border-radius: 20px;
  background-color: $bg-primary;
  box-shadow: 0 3px 10px rgb(0 0 0 / 0.2);

  padding: 40px;
  margin-top: 30px;
}

.panel-content {
  position: relative;
  left: 0px;
  //height: 100%;
  //width: 1000px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  width: 100%;
  position: relative;
}

.panel-title {
  width: 100%;
  height: 80px;
  padding: 0px 0px 5px 5px;
  border-bottom: solid $bg-primary;
  text-align: left;
  font-size: 50px;
}

.close-icon {
  width: 50px;
  height: 50px;
  position: absolute;
  top: 25px;
  right: 25px;
  cursor: pointer;
  z-index: 1;
  padding: 18px;
}
</style>
