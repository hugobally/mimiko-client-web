<template>
  <div class="map-list-item-container noselect">
    <div
      class="map-navigate-group"
      @click="onItemClick ? onItemClick(map) : navigateToMap()"
    >
      <img
        class="map-flagship-cover"
        :src="map.flagship && map.flagship.imgURL"
      />
      <span class="map-title">{{ map.title }}</span>
    </div>
    <div v-if="!readOnly" class="map-actions" @click="deleteMap">
      <transition name="delete-confirm" mode="out-in">
        <img
          v-if="!askDeleteConfirm"
          src="@/assets/svg/delete-icon.svg"
          alt="delete-icon"
          width="30"
          height="30"
        />
        <div v-else>
          <button @click.stop="deleteMap({ confirmed: true })" class="button">
            Confirm
          </button>
          <button @click.stop="askDeleteConfirm = false" class="button">
            Cancel
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { deleteMap as apiDeleteMap } from '@/api/graphql'

export default {
  props: ['map', 'readOnly', 'onItemClick'],
  data() {
    return {
      askDeleteConfirm: false,
    }
  },
  methods: {
    navigateToMap() {
      this.$router.push({ path: `/map/${this.map.id}` })
    },
    async deleteMap({ confirmed }) {
      if (!this.askDeleteConfirm) {
        this.askDeleteConfirm = true
        return
      }

      if (!confirmed) return

      try {
        await apiDeleteMap(this.map.id)
        this.$store.commit('maplist/USER_MAPS_REMOVE', this.map.id)
      } catch (error) {
        this.$store.dispatch('ui/pushFlashQueue', {
          content: 'Error when trying to delete the map, please retry.',
          type: 'error',
        })
      } finally {
        this.askDeleteConfirm = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.map-list-item-container {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
}

.map-navigate-group {
  flex: 1;
  min-width: 0;

  display: flex;
  cursor: pointer;
  align-items: center;
}

.map-list-item-container:hover {
  background-color: $black;
  color: $text-highlight;
}

.map-flagship-cover {
  flex: initial;
  width: 90px;
  height: 90px;
  margin: 5px;
  border-radius: 5px;
}

.map-title {
  flex: 2;

  margin-left: 10px;
  font-size: 40px;

  text-align: left;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-author-name {
  flex: 1;
  min-width: 0;
  margin-right: 5px;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: right;
}

.map-actions {
  flex: initial;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100px;
  height: 100px;
  cursor: pointer;
}

.map-actions:hover {
  .map-action-delete-path {
    fill: $bg-primary;
  }
}

.map-action-delete-path {
  fill: none;
}

.delete-confirm-enter-active,
.delele-confirm-leave-active {
  transition: all 0.05s;
}

.delete-confirm-enter,
.delete-confirm-leave-to {
  opacity: 0;
}
</style>
