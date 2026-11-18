<script setup lang="ts">
import FileList from '@/components/file-browser/FileList.vue';
import LoadingData from '@/components/notification/LoadingData.vue';
import ButtonLink from '@/components/ui/ButtonLink.vue';
import HeaderWithAction from '@/components/ui/HeaderWithAction.vue';
import RefreshButton from '@/components/ui/RefreshButton.vue';

const route = useRoute();

const { addToPlaylistModal } = usePlaylist();
const { downloadTrack, getMediaLibraryContent } = useMediaLibrary();
const { openTrackDetailsModal } = useMediaInformation();
const { addTracksToQueue, addTrackToQueue, playTracks, playTracksShuffled } =
  useAudioPlayer();
const { dragStart } = useDragAndDrop();

/* istanbul ignore next -- @preserve */
const {
  data: musicDirectoryData,
  refresh,
  status,
} = useAsyncData(
  route.fullPath,
  async () => {
    const musicDirectory = await getMediaLibraryContent(
      route.params as FilesParams,
    );

    return {
      musicDirectory,
    };
  },
  {
    default: () => ({
      musicDirectory: DEFAULT_MEDIA_LIBRARY,
    }),
    getCachedData: (key, nuxtApp, ctx) => {
      if (ctx.cause === 'refresh:manual') {
        return undefined;
      }

      return nuxtApp.payload.data[key] || nuxtApp.static.data[key];
    },
  },
);

const tracks = computed(() => musicDirectoryData.value.musicDirectory.tracks);

function onPlayTrack(index: number) {
  playTracks(tracks.value, index);
}

useHead({
  title: 'Files',
});
</script>

<template>
  <HeaderWithAction>
    <h1>Media Library</h1>

    <template #actions>
      <template v-if="tracks.length">
        <ButtonLink
          :id="KEYBOARD_SHORTCUT_ELEMENT_IDS.playAllButton"
          ref="playTracksButton"
          :icon="ICONS.play"
          iconSize="large"
          title="Play tracks"
          @click="playTracks(tracks)"
        >
          Play tracks
        </ButtonLink>

        <ButtonLink
          :id="KEYBOARD_SHORTCUT_ELEMENT_IDS.shuffleAllButton"
          ref="shuffleTracksButton"
          :icon="ICONS.shuffle"
          iconSize="large"
          title="Shuffle tracks"
          @click="playTracksShuffled(tracks)"
        >
          Shuffle tracks
        </ButtonLink>

        <ButtonLink
          ref="addTracksToQueueButton"
          :icon="ICONS.add"
          iconSize="large"
          title="Add tracks to queue"
          @click="addTracksToQueue(tracks)"
        >
          Add tracks to queue
        </ButtonLink>
      </template>

      <RefreshButton :status @refresh="refresh" />
    </template>
  </HeaderWithAction>

  <LoadingData :status>
    <FileList
      :folders="musicDirectoryData.musicDirectory.folders"
      :tracks
      @addToPlaylist="addToPlaylistModal"
      @addToQueue="addTrackToQueue"
      @downloadMedia="downloadTrack"
      @dragStart="dragStart"
      @mediaInformation="openTrackDetailsModal"
      @playTrack="onPlayTrack"
    />
  </LoadingData>
</template>
