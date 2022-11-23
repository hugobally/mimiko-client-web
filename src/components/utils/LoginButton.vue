<template>
  <div>
    <a
      class="login-button link"
      :href="spotifyLoginUrl"
      @click="storeCurrentUrl"
    >
      <img
        class="spotify-logo"
        src="@/assets/svg/spotify-logo.svg"
        alt="spotify-logo"
      />
      <slot></slot>
    </a>
    <button class="login-button link" @click="loginSampleSession">
      DEBUG DEBUG DEBUG
    </button>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      spotifyLoginUrl: process.env.VUE_APP_BACKEND_URL + '/login_spotify',
      sampleSessionLoginUrl:
        process.env.VUE_APP_BACKEND_URL + '/login_sample_session',
    }
  },
  methods: {
    storeCurrentUrl() {
      localStorage.setItem('path_before_login', this.$route.path)
    },
    async loginSampleSession() {
      // try {
      await axios.post(
        process.env.VUE_APP_BACKEND_URL + '/login_sample_session',
        crypto.randomUUID(),
        {
          withCredentials: true,
        },
      )
      await this.$store.dispatch('auth/whoami')
      location.reload()
      // } catch (error) {
      //   await this.$store.dispatch('ui/pushFlashQueue', {
      //     content: 'Login failed',
      //     type: 'error',
      //   })
      // }
    },
  },
}
</script>

<style lang="scss" scoped>
.login-button {
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: $bg-primary;
  color: $text-primary;
  border: solid 1px black;

  padding: 12px;
}

.spotify-logo {
  width: 20px;
  height: 20px;
  margin-right: 5px;
}
</style>
