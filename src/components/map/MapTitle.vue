<template>
  <div
    v-if="id"
    class="map-title-container noselect"
    :class="{ hoverable: !readOnly }"
    @click="openSettings"
  >
    <span>{{ meta.title }}</span>
    <span>
      <span v-if="readOnly" class="title-separator">by</span>
      <span v-if="readOnly">{{ meta.author.username }}</span>
    </span>
    <img
      v-if="!readOnly"
      class="settings-icon"
      src="@/assets/svg/cogwheel.svg"
      alt="settings"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('map', ['id', 'meta', 'readOnly']),
  },
  methods: {
    openSettings() {
      if (this.readOnly) return

      this.$router.replace({
        path: this.$route.path,
        query: this.$route.query,
        hash: '#map-settings',
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.map-title-container {
  position: absolute;
  top: 5px;
  left: 10px;
  padding: 5px;

  font-size: 25px;
  color: $text-primary;
  background-color: $bg-primary;

  display: flex;
  align-items: center;

  .settings-icon {
    display: none;
  }
}

.title-separator {
  padding: 0px 5px;
  color: $bg-secondary;
}

.settings-icon {
  width: 20px;
  height: 20px;
  margin-left: 5px;
}

.hoverable:hover {
  cursor: pointer;
  background-color: $bg-hover;
  color: $bg-primary;

  .settings-icon {
    display: inline;
  }
}
</style>
