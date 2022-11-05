<template>
  <div
    class="user noselect"
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
  >
    <div class="username-container" v-if="user.logged">
      <div class="username">
        <span>{{ user.username !== '' ? user.username : user.id }}</span>
        <svg class="caret" viewBox="0 0 49.892857 20.15317">
          <g transform="translate(-25.324405,-234.5135)" id="layer1">
            <path
              id="path2492"
              d="M 25.324405,254.66667 H 75.21726 L 50.081843,234.5135 Z"
              style="fill:#000000;stroke:none;stroke-width:0.26458332px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
            />
          </g>
        </svg>
      </div>
      <ul class="user-menu" v-if="hovered">
        <li @click="showSettings"><a class="link">Settings</a></li>
        <li @click="logout"><a class="link">Logout</a></li>
      </ul>
    </div>
    <LoginButton v-else>Login</LoginButton>
  </div>
</template>

<script>
import axios from 'axios'

import LoginButton from '@/components/utils/LoginButton'

export default {
  components: { LoginButton },
  data() {
    return {
      hovered: false,
    }
  },
  computed: {
    user() {
      return this.$store.state.auth.user
    },
  },
  methods: {
    showSettings() {
      this.$router.replace({
        path: this.$route.path,
        query: this.$route.query,
        hash: '#settings',
      })
    },
    async logout() {
      try {
        await axios.post(
          process.env.VUE_APP_BACKEND_URL + '/logout',
          {},
          {
            withCredentials: true,
          },
        )
        this.$store.commit('auth/RESET_AUTH')
        this.$router.push({ path: '/welcome' })
      } catch (error) {
        // TODO
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.user {
  position: relative;

  cursor: pointer;
  width: 100px;

  padding: 0px 10px;

  flex: initial;

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: $bg-primary;
  border-left: solid 1px black;
}

.user:hover {
  background-color: $bg-primary;
}

.username {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

@media (max-width: 799px) {
  .user {
    display: none;
  }
}

@media (min-width: 1024px) {
  .user {
    width: 250px;
  }
}

.caret {
  margin-left: 5px;
  width: 10px;
  height: 10px;
}

.username-container {
  width: 100%;
  height: 100%;
  display: flex;

  align-items: center;
  justify-content: center;
}

.user-menu {
  position: absolute;
  bottom: 63px;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: $bg-secondary;
  color: $text-highlight;
  border-bottom: solid black 1px;

  li {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 10px;
    list-style: none;
  }

  li:hover {
    background-color: $bg-secondary-shade;
  }
}
</style>
