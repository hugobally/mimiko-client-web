<template>
  <div class="flash-container" :class="classObj">
    {{ message.content }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: {},
    }
  },
  computed: {
    msgQueue() {
      return this.$store.state.ui.flashQueue
    },
    msgQueueIsEmpty() {
      return this.msgQueue.length === 0
    },
    classObj() {
      return [{ hidden: this.msgQueueIsEmpty }, this.message.type || 'info']
    },
  },
  watch: {
    msgQueue: function() {
      this.displayMsg(this.msgQueue)
    },
  },
  methods: {
    async displayMsg(queue) {
      if (queue.length === 0) return

      this.message = queue[0]
      await new Promise(r => setTimeout(r, this.message.time || 3000))
      this.$store.dispatch('ui/shiftFlashQueue')
    },
  },
  mounted() {
    this.displayMsg(this.$store.state.ui.flashQueue)
  },
}
</script>

<style lang="scss" scoped>
.flash-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.hidden {
  display: none;
}

.info {
  background-color: $black;
  color: $text-highlight;
}

.success {
  background-color: palegreen;
}

.error {
  background-color: crimson;
  color: $text-highlight;
}
</style>
