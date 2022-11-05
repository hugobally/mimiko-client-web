<template>
  <footer>
    <div class="nav-center-container">
      <div class="nav-container">
        <Menu />
        <Player v-if="logged" />
<!--        <div class="filler" v-else></div>-->
<!--        <User />-->
        </div>
      </div>
  </footer>
</template>

<script>
import Menu from '@/components/nav/Menu'
import Player from '@/components/nav/Player'
import User from '@/components/nav/User'

export default {
  components: {
    Menu,
    Player,
    // User,
  },
  computed: {
    logged() {
      return this.$store.state.auth.user.logged
    },
  },
}
</script>

<style lang="scss" scoped>
.nav-center-container {
  display: flex;
  height: 100%;
  width: 100%;
  //margin-left: 32px;
  align-items: center;
  justify-content: center;
}

.nav-container {
  display: flex;
  height: 100%;
  gap: 10px;
  //border: solid 2px $black;
}

.filler {
  flex: 1;
  background-color: $bg-primary;
}
</style>
