<template>
  <div class="menu">
    <div class="menu-buttons">
      <router-link
        to="/home"
        class="menu-item menu-button noselect leftmost-menu-button"
        tag="div"
        :class="{ 'highlighted-button': currentPanel === 'home' }"
      >
        <HomeIcon class="menu-icon" />
      </router-link>
      <div
        @click="toggleCreator"
        class="menu-item menu-button noselect"
        :class="{ 'highlighted-button': currentPanel === '#new' }"
      >
        <svg
          width="30"
          height="30"
          viewBox="0 0 578 578"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M498.259 464.134L416.459 382.574C442.851 348.951 457.171 307.43 457.118 264.686C457.118 226.619 445.83 189.406 424.681 157.755C403.532 126.103 373.472 101.434 338.303 86.866C303.133 72.2984 264.434 68.4868 227.098 75.9133C189.763 83.3399 155.468 101.671 128.55 128.588C101.632 155.506 83.3014 189.801 75.8749 227.137C68.4483 264.472 72.2599 303.172 86.8276 338.341C101.395 373.511 126.065 403.57 157.716 424.719C189.368 445.868 226.58 457.157 264.647 457.157C307.392 457.21 348.912 442.889 382.536 416.497L464.095 498.297C466.332 500.552 468.993 502.342 471.925 503.564C474.856 504.785 478.001 505.414 481.177 505.414C484.353 505.414 487.498 504.785 490.429 503.564C493.361 502.342 496.022 500.552 498.259 498.297C500.514 496.061 502.304 493.4 503.525 490.468C504.746 487.536 505.375 484.391 505.375 481.215C505.375 478.039 504.746 474.895 503.525 471.963C502.304 469.031 500.514 466.37 498.259 464.134V464.134ZM120.294 264.686C120.294 236.135 128.76 208.226 144.622 184.488C160.484 160.749 183.029 142.247 209.406 131.321C235.783 120.395 264.807 117.537 292.809 123.106C320.811 128.676 346.532 142.425 366.72 162.613C386.909 182.801 400.657 208.522 406.227 236.524C411.797 264.526 408.938 293.55 398.012 319.927C387.086 346.304 368.584 368.849 344.846 384.711C321.107 400.573 293.198 409.039 264.647 409.039C226.363 409.039 189.646 393.83 162.574 366.759C135.503 339.687 120.294 302.971 120.294 264.686Z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import HomeIcon from '@/assets/svg/home-icon.svg'

export default {
  components: {
    HomeIcon,
  },
  computed: {
    currentPanel() {
      if (!this.$route) return ''

      if (!this.$route.hash && this.$route.path.includes('home')) return 'home'

      return this.$route.hash
    },
  },
  methods: {
    toggleExplorer() {
      const newHash = this.currentPanel === '#explore' ? '' : '#explore'
      this.$router.push({ path: this.$route.path, hash: newHash })
    },
    toggleCreator() {
      const newHash = this.currentPanel === '#new' ? '' : '#new'
      this.$router.push({ path: this.$route.path, hash: newHash })
    },
  },
}
</script>

<style lang="scss" scoped>
.menu {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: $bg-secondary;
  border-radius: 5px;
}

.logo-container {
  width: 64px;
  height: 64px;

  display: flex;
  align-items: center;
  justify-content: center;

  transition: all 0.05s ease-out;
}

.logo {
  width: 44px;
  height: 44px;
}

.menu-buttons {
  height: 100%;
  flex: 1;
  display: flex;
}

.menu-button {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.menu-item {
  width: 80px;
}

.menu-button:hover {
  backdrop-filter: brightness(200%);
  transition: backdrop-filter 200ms;
}

.highlighted-button {
  backdrop-filter: brightness(220%);
  transition: backdrop-filter 200ms;
}

.leftmost-menu-button {
  border-radius: 5px 0px 0px 5px;
}

.menu-icon {
  width: 30px;
  height: 30px;
}

</style>
