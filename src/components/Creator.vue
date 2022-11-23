<template>
  <div class="welcome-text-container">
    <img
      width="100"
      height="100"
      src="@/assets/svg/favicon.svg"
      alt="mimiko-logo"
      class="mimiko-logo"
    />
    <div>
      <div class="welcome-text">
        <h1 class="welcome-text-title">Welcome to MIMIKO !</h1>
        <p class="welcome-text-content">
          Discover new songs by starting from a song you like, and create a map
          of new music !
        </p>
        <p class="welcome-text-content">
          For any issues or question, you can find
          <a href="https://github.com/hugobally/mimiko/issues"
            >the project on github</a
          >
          or <a href="mailto:bally.hugo@gmail.com">send me an email</a>.
        </p>
      </div>
      <Explorer />
    </div>
  </div>
</template>

<script>
// import SearchTrack from "@/components/SearchTrack";
import Explorer from '@/components/Explorer'

export default {
  components: {
    Explorer,
  },
}
</script>

<style lang="scss" scoped>
.welcome-text-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: left;
}

.welcome-text {
  margin-bottom: 40px;
}

.welcome-text,
.search-track-container {
  margin-left: 30px;
}

.welcome-text > p {
  margin-top: 20px;
}

.welcome-text-content {
  max-width: 400px;
}

.mimiko-logo {
  border-radius: 50px;
}
</style>
