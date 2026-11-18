<script setup lang="ts">
import PreloadImage from '@/components/media/PreloadImage.vue';
import TracklistGeneric from '@/components/tracklist/TracklistGeneric.vue';
import LazyLoadContent from '@/components/ui/LazyLoadContent.vue';
import MarqueeScroll from '@/components/ui/MarqueeScroll.vue';

defineProps<{
  folders: MusicFolder[];
  tracks: Track[];
}>();

defineEmits<{
  addToPlaylist: [trackId: string];
  addToQueue: [track: Track];
  downloadMedia: [track: Track];
  dragStart: [track: Track, event: DragEvent];
  mediaInformation: [track: Track];
  playTrack: [index: number];
}>();
</script>

<template>
  <div
    v-if="
      $route.params[ROUTE_PARAM_KEYS.files.id] ||
      folders.length ||
      !tracks.length
    "
    :class="['trackTable', { mBL: tracks.length }]"
  >
    <div
      v-if="$route.params[ROUTE_PARAM_KEYS.files.id]"
      ref="goBack"
      class="trackRow"
    >
      <div class="trackCell">
        <NuxtLink
          draggable="false"
          :to="$route.fullPath.split('/').slice(0, -1).join('/')"
        >
          <PreloadImage
            alt="Go back"
            :class="$style.trackImage"
            :image="FALLBACK_ICON_BY_TYPE.folderBack"
          />
          ...
          <p class="visuallyHidden">Go back</p>
        </NuxtLink>
      </div>
    </div>

    <LazyLoadContent
      v-for="folder in folders"
      :key="folder.id"
      class="trackRow"
      data-test-id="folder"
    >
      <div class="trackCell">
        <NuxtLink draggable="false" :to="`${$route.fullPath}/${folder.id}`">
          <PreloadImage
            :alt="folder.name"
            :class="$style.trackImage"
            :image="folder.image"
          />

          <MarqueeScroll class="mBXS" inert>
            {{ folder.name }}
          </MarqueeScroll>
        </NuxtLink>
      </div>
    </LazyLoadContent>

    <div v-if="!folders.length && !tracks.length" class="trackRow">
      <div ref="noFoldersFiles" class="trackCell">
        <div>
          <PreloadImage
            alt="No folders or files"
            :class="$style.trackImage"
            :image="FALLBACK_ICON_BY_TYPE.noFolder"
          />

          <p>No folders/files found.</p>
        </div>
      </div>
    </div>
  </div>

  <TracklistGeneric
    v-if="tracks.length"
    :tracks
    @addToPlaylist="(trackId) => $emit('addToPlaylist', trackId)"
    @addToQueue="(track) => $emit('addToQueue', track)"
    @downloadMedia="(track) => $emit('downloadMedia', track)"
    @dragStart="(track, event) => $emit('dragStart', track, event)"
    @mediaInformation="(track) => $emit('mediaInformation', track)"
    @playTrack="(index) => $emit('playTrack', index)"
  />
</template>

<style module>
.trackImage {
  width: var(--track-width-height-default);
  height: var(--track-width-height-default);
  overflow: hidden;
  border-radius: var(--border-radius-medium);
}
</style>
