<template>
  <div class="settings-container">
    <SearchInput
      class="rename-input"
      @submit="renameUser"
      :valueProp="username"
      label="Change your display name"
      :submitWord="!busy ? 'Change' : 'Working...'"
      :valid="validUsername || !renameRetry"
      :busy="busy"
      :success="renameSuccess"
    />
  </div>
</template>

<script>
import { updateUsername as gqlUpdateUsername } from '@/api/graphql'
import SearchInput from '@/components/creator/SearchInput'

export default {
  components: {
    SearchInput,
  },
  data() {
    return {
      busy: false,
      username: null,
      validUsername: false,
      renameRetry: false,
      renameSuccess: false,
    }
  },
  created() {
    this.username = this.$store.state.auth.user.username
  },
  methods: {
    async renameUser(username) {
      if (this.busy) return

      try {
        this.busy = true
        this.renameRetry = false
        this.validUsername = true

        if (!validateUsername(username)) {
          this.validUsername = false
          this.renameSuccess = false
          return
        }

        this.validUsername = true

        const user = await gqlUpdateUsername(username)

        if (!user) throw new Error()

        this.$store.commit('auth/SET_USERNAME', username)
        this.renameSuccess = true
      } catch (error) {
        this.$store.dispatch('ui/pushFlashQueue', {
          content: 'Your username could not be updated',
          type: 'error',
        })
        return
      } finally {
        this.renameRetry = true
        this.busy = false
      }
    },
  },
}

function validateUsername(username) {
  if (username.length < 3 || username.length > 30) return false
  if (!/^[\w]+$/.test(username)) return false

  return true
}
</script>

<style lang="scss" scoped>
.settings-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
