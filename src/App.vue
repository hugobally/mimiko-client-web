<template>
  <div id="app">
    <router-view :key="routePath" class="page-layout" />

    <div class="dimmer" v-if="panelContent" />
    <Panel v-if="panelContent">
      <component :is="panelContent" />
    </Panel>

    <Nav :class="{ hidden: maskNav && !logged }" class="nav-layout"> </Nav>
    <FlashMessage class="flash-layout" />
  </div>
</template>

<script>
import Nav from '@/components/Nav'
import Panel from '@/components/Panel'
import Explorer from '@/components/Explorer'
import MapSettings from '@/components/map/MapSettings'
import Settings from '@/components/Settings'
import FlashMessage from '@/components/utils/FlashMessage'

export default {
  props: ['hideNav'],
  components: {
    Nav,
    FlashMessage,
    Panel,
    Settings,
    new: Explorer,
    settings: Settings,
    'map-settings': MapSettings,
  },
  data() {
    return {
      maskNav: true,
    }
  },
  computed: {
    panelContent() {
      return this.$route.hash.slice(1)
    },
    routePath() {
      return this.$route.path
    },
    logged() {
      if (!this.$store.auth) return false

      return this.$store.auth.user
    },
  },
  watch: {
    routePath(newVal) {
      if (newVal.includes('welcome')) {
        this.maskNav = true
      } else {
        this.maskNav = false
      }
    },
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Abel&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: $bg-primary;
}
#app {
  //font-family: 'IBM Plex Sans', sans-serif;
  font-family: 'Abel', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-primary;
}

img,
.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Opera and Firefox */
}

.hidden {
  display: none;
}

.link {
  text-decoration: none;
}

.mask-nav {
  background-color: $bg-primary;
  z-index: 2;
}

.disable-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.disable-scrollbar::-webkit-scrollbar {
  width: 0px;
  background: transparent; /* Chrome/Safari/Webkit */
}

.button {
  text-decoration: none;
  border: solid 1px black;
  padding: 5px;
  background-color: $bg-primary;
  color: $text-primary;
  cursor: pointer;
}

.button:hover {
  background-color: $bg-secondary;
  color: $text-highlight;
}

.nav-layout {
  position: fixed;
  bottom: 30px;
  width: 100%;
  height: $navbar-height;
}

.flash-layout {
  position: fixed;
  top: 0px;
  min-width: 100%;
  min-height: 50px;
  z-index: 2;
}

.page-layout {
  width: 100%;
  height: 100%;
}

.dimmer {
  background: #000;
  opacity: 0.75;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  //z-index: 100;
}

button,
.link {
  border-radius: 10px;
  background: $bg-secondary;
  color: $text-highlight;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 20px;
  font-family: 'Abel', sans-serif;
}

.shadow {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}
</style>
