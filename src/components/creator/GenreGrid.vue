<template>
  <div class="genre-grid-container">
    <button
      v-for="(genre, i) in genreList"
      :key="i"
      class="genre-button"
      @click="onButtonClick(genre)"
    >
      {{ genre.name }}
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      genreList: [
        {
          name: 'classical',
        },
        {
          name: 'jazz',
        },
      ],
    }
  },
}
</script>

<style>
.genre-grid-container {
  display: grid;
  grid-gap: 1em;
}

.genre-button {
  display: inline-block;
  padding: 0.5em 1em;
  text-decoration: none;
  background: #668ad8; /*Button Color*/
  color: #fff;
  border-bottom: solid 4px #627295;
  border-radius: 5px;
}
.genre-button:active {
  /*on Click*/
  -ms-transform: translateY(4px);
  -webkit-transform: translateY(4px);
  transform: translateY(4px); /*Move down*/
  border-bottom: none; /*disappears*/
}
</style>
