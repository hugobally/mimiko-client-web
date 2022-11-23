<template>
  <div>
    <div class="input-label" v-if="label">
      <span>{{ label }}</span>
    </div>
    <div class="search-input-container">
      <div class="input-group">
        <input
          class="text-input"
          :class="{ invalid: !valid && !refreshed }"
          type="search"
          v-model="value"
          :placeholder="placeholder"
          @keyup.enter="emitSubmit"
        />
        <ul v-show="autocompleteResults" class="autocomplete-group">
          <li
            v-for="(result, i) in autocompleteResults"
            :key="i"
            @click="selectAutocompleteResult(result)"
          >
            {{ result }}
          </li>
        </ul>
      </div>
      <button
        class="side-button"
        :class="{ busy: busy, success: success && !refreshed }"
        @click="emitSubmit"
      >
        {{ submitWord }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'placeholder',
    'submitWord',
    'valueProp',
    'valid',
    'label',
    'busy',
    'success',
    'autocompleteFunction',
  ],
  data() {
    return {
      value: '',
      refreshed: false,
      autocompleteResults: null,
      autocompleteDebounce: null,
    }
  },
  // TODO Click outside of autocomplete results box removes the box
  mounted() {
    this.$el.addEventListener('keyup', (e) => {
      if (e.code !== 'Enter') this.autocomplete()
      this.refreshed = true
    })
    if (this.valueProp) this.value = this.valueProp
  },
  methods: {
    emitSubmit() {
      this.refreshed = false
      this.$emit('submit', this.value)
    },
    autocomplete() {
      if (this.autocompleteDebounce) {
        clearTimeout(this.autocompleteDebounce)
        this.autocompleteDebounce = null
      }

      if (!this.value || this.value.length < 1) {
        this.autocompleteResults = null
        return
      }

      this.autocompleteDebounce = setTimeout(async () => {
        try {
          this.autocompleteResults = await this.autocompleteFunction(this.value)
        } catch (error) {
          // TODO
        }

        this.autocompleteDebounce = null
      }, 200)
    },
    selectAutocompleteResult(result) {
      this.value = result
      this.autocompleteResults = null
    },
  },
}
</script>

<style lang="scss" scoped>
.search-input-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-group {
  position: relative;
  z-index: 2;
}

.autocomplete-group {
  position: absolute;
  width: 100%;

  // display: flex;
  // flex-direction: column;
  background-color: $bg-primary-shade;

  cursor: pointer;

  li {
    list-style: none;
    text-align: left;

    overflow: hidden;
    text-overflow: clip;
    white-space: nowrap;
    padding: 5px;
  }

  li:hover {
    background-color: $bg-primary-dark;
  }
}

.input-label {
  font-size: 30px;
  text-align: center;
  margin-bottom: 60px;
  width: 100%;
  color: $text-primary;
}

.side-button {
  margin-left: 20px;
}

.side-button:hover {
  scale: 90%;
  transition: scale 200ms;
}

.text-input {
  //background-color: $bg-secondary;
  //color: $text-highlight;
  padding: 10px;
  border: 1px solid black;
  font-family: 'Abel', sans-serif;
  font-size: 20px;
  border-radius: 5px;
}

.busy {
  opacity: 0.5;
  pointer-events: none;
}

.invalid {
  border: 3px solid #ff4444;
}

.success {
  background-color: $green;
}

@media (max-width: 600px) {
  .side-button {
    height: 30px;
    width: 50px;
  }
}

@media (min-width: 601px) {
  .text-input {
    width: 250px;
    height: 60px;
  }

  .side-button {
    height: 45px;
    width: 70px;
  }
}

@media (min-width: 800px) {
  .text-input {
    width: 400px;
    height: 70px;
  }

  .side-button {
    height: 60px;
    width: 100px;
  }
}
</style>
