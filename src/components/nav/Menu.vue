<template>
  <div class="menu">
    <!-- <div class="logo-container">
      <img class="logo" src="@/assets/svg/logo-text.svg" alt="logo-link-home" />
    </div> -->
    <div class="menu-buttons">
      <router-link to="/home" class="menu-item menu-button noselect leftmost-menu-button" tag="div"
                   :class="{ 'highlighted-button': currentPanel == 'home' }"
      >
        <svg width="30" height="30" viewBox="0 0 578 578" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M240.589 336.862H336.824V505.274H240.589V336.862Z" />
          <path d="M491.281 244.958L305.788 55.374C303.551 53.119 300.89 51.3292 297.958 50.1077C295.027 48.8863 291.882 48.2574 288.706 48.2574C285.53 48.2574 282.385 48.8863 279.454 50.1077C276.522 51.3292 273.861 53.119 271.624 55.374L86.1305 245.198C81.642 249.723 78.0971 255.094 75.7017 261C73.3062 266.906 72.1079 273.229 72.1764 279.602V481.216C72.1577 493.532 76.8624 505.386 85.3215 514.337C93.7806 523.289 105.35 528.656 117.648 529.333H192.471V312.804C192.471 306.423 195.005 300.303 199.517 295.791C204.029 291.28 210.149 288.745 216.529 288.745H360.883C367.263 288.745 373.383 291.28 377.895 295.791C382.407 300.303 384.941 306.423 384.941 312.804V529.333H459.764C472.062 528.656 483.631 523.289 492.09 514.337C500.55 505.386 505.254 493.532 505.236 481.216V279.602C505.255 266.681 500.251 254.258 491.281 244.958V244.958Z"/>
        </svg>
      </router-link>
<!--      <div-->
<!--        @click="toggleExplorer"-->
<!--        class="menu-item menu-button noselect"-->
<!--        :class="{ 'highlighted-button': currentPanel == '#explore' }"-->
<!--      >-->
<!--        <span>Explore</span>-->
<!--      </div>-->
      <div
        @click="toggleCreator"
        class="menu-item menu-button noselect"
        :class="{ 'highlighted-button': currentPanel == '#new' }"
      >
        <svg width="30" height="30" viewBox="0 0 578 578" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M498.259 464.134L416.459 382.574C442.851 348.951 457.171 307.43 457.118 264.686C457.118 226.619 445.83 189.406 424.681 157.755C403.532 126.103 373.472 101.434 338.303 86.866C303.133 72.2984 264.434 68.4868 227.098 75.9133C189.763 83.3399 155.468 101.671 128.55 128.588C101.632 155.506 83.3014 189.801 75.8749 227.137C68.4483 264.472 72.2599 303.172 86.8276 338.341C101.395 373.511 126.065 403.57 157.716 424.719C189.368 445.868 226.58 457.157 264.647 457.157C307.392 457.21 348.912 442.889 382.536 416.497L464.095 498.297C466.332 500.552 468.993 502.342 471.925 503.564C474.856 504.785 478.001 505.414 481.177 505.414C484.353 505.414 487.498 504.785 490.429 503.564C493.361 502.342 496.022 500.552 498.259 498.297C500.514 496.061 502.304 493.4 503.525 490.468C504.746 487.536 505.375 484.391 505.375 481.215C505.375 478.039 504.746 474.895 503.525 471.963C502.304 469.031 500.514 466.37 498.259 464.134V464.134ZM120.294 264.686C120.294 236.135 128.76 208.226 144.622 184.488C160.484 160.749 183.029 142.247 209.406 131.321C235.783 120.395 264.807 117.537 292.809 123.106C320.811 128.676 346.532 142.425 366.72 162.613C386.909 182.801 400.657 208.522 406.227 236.524C411.797 264.526 408.938 293.55 398.012 319.927C387.086 346.304 368.584 368.849 344.846 384.711C321.107 400.573 293.198 409.039 264.647 409.039C226.363 409.039 189.646 393.83 162.574 366.759C135.503 339.687 120.294 302.971 120.294 264.686Z"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
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

</style>
