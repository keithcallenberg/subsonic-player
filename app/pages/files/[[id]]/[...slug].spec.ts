import type { VueWrapper } from '@vue/test-utils';

import { getFormattedTracksMock } from '@@/test/helpers';
import { useAudioPlayerMock } from '@@/test/useAudioPlayerMock';
import { useHeadMock } from '@@/test/useHeadMock';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';

import FileList from '@/components/file-browser/FileList.vue';
import RefreshButton from '@/components/ui/RefreshButton.vue';

import FilesPage from './[...slug].vue';

mockNuxtImport('useAPI', () => () => ({
  fetchData: vi.fn(),
  getImageUrl: vi.fn((path) => path),
}));

const addToPlaylistModalMock = vi.hoisted(() => vi.fn());

mockNuxtImport('usePlaylist', (original) => () => ({
  ...original(),
  addToPlaylistModal: addToPlaylistModalMock,
}));

const { downloadTrackMock, getMediaLibraryContentMock } = vi.hoisted(() => ({
  downloadTrackMock: vi.fn(),
  getMediaLibraryContentMock: vi.fn(),
}));

mockNuxtImport('useMediaLibrary', (original) => () => ({
  ...original(),
  downloadTrack: downloadTrackMock,
  getMediaLibraryContent: getMediaLibraryContentMock,
}));

const openTrackDetailsModalMock = vi.hoisted(() => vi.fn());

mockNuxtImport('useMediaInformation', (original) => () => ({
  ...original(),
  openTrackDetailsModal: openTrackDetailsModalMock,
}));

const dragStartMock = vi.hoisted(() => vi.fn());

mockNuxtImport('useDragAndDrop', (original) => () => ({
  ...original(),
  dragStart: dragStartMock,
}));

const musicDirectoryDataMock = ref({
  musicDirectory: {
    folders: [],
    tracks: getFormattedTracksMock(2),
  },
});

const refreshMock = vi.hoisted(() => vi.fn());
const statusMock = ref('success');

mockNuxtImport('useAsyncData', () => () => ({
  data: musicDirectoryDataMock,
  error: ref(null),
  pending: ref(false),
  refresh: refreshMock,
  status: statusMock,
}));

const { useHeadTitleMock } = useHeadMock();
const {
  addTracksToQueueMock,
  addTrackToQueueMock,
  playTracksMock,
  shuffleTracksMock,
} = useAudioPlayerMock();

const track = getFormattedTracksMock()[0];

async function factory(props = {}, route = '/files/folder1/subfolder') {
  return mountSuspended(FilesPage, {
    global: {
      stubs: {
        FileList: true,
      },
    },
    props: {
      ...props,
    },
    route,
  });
}

describe('[...slug]', () => {
  let wrapper: VueWrapper;

  beforeEach(async () => {
    wrapper = await factory();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('matches the snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('sets the useHead function with correct title', () => {
    expect(useHeadTitleMock.value).toBe('Files');
  });

  describe.each([
    ['playTracksButton', () => playTracksMock],
    ['shuffleTracksButton', () => shuffleTracksMock],
    ['addTracksToQueueButton', () => addTracksToQueueMock],
  ])('when the %s is clicked', (ref, getMock) => {
    beforeEach(async () => {
      await wrapper.findComponent({ ref }).trigger('click');
    });

    it('calls the correct function with the directory tracks', () => {
      expect(getMock()).toHaveBeenCalledWith(
        musicDirectoryDataMock.value.musicDirectory.tracks,
      );
    });
  });

  describe('when the directory has no tracks', () => {
    beforeEach(async () => {
      musicDirectoryDataMock.value.musicDirectory.tracks = [];

      wrapper = await factory();
    });

    afterEach(() => {
      musicDirectoryDataMock.value.musicDirectory.tracks =
        getFormattedTracksMock(2);
    });

    it.each([
      'playTracksButton',
      'shuffleTracksButton',
      'addTracksToQueueButton',
    ])('does not show the %s', (ref) => {
      expect(wrapper.findComponent({ ref }).exists()).toBe(false);
    });
  });

  it('does not show the load error message', () => {
    expect(wrapper.findComponent({ ref: 'loadError' }).exists()).toBe(false);
  });

  describe('when the directory fails to load', () => {
    beforeEach(async () => {
      statusMock.value = 'error';

      wrapper = await factory();
    });

    afterEach(() => {
      statusMock.value = 'success';
    });

    it('matches the snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot();
    });

    it('shows the load error message', () => {
      expect(wrapper.findComponent({ ref: 'loadError' }).exists()).toBe(true);
    });

    it('does not show the FileList component', () => {
      expect(wrapper.findComponent(FileList).exists()).toBe(false);
    });
  });

  describe('when the FileList component emits the dragStart event', () => {
    beforeEach(() => {
      wrapper.findComponent(FileList).vm.$emit('dragStart', track, 'event');
    });

    it('calls the dragStart function with the correct parameters', () => {
      expect(dragStartMock).toHaveBeenCalledWith(track, 'event');
    });
  });

  describe('when the RefreshButton emits the refresh event', () => {
    beforeEach(() => {
      wrapper.findComponent(RefreshButton).vm.$emit('refresh');
    });

    it('calls the refresh function', () => {
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  describe('when the FileList component emits the addToPlaylist event', () => {
    beforeEach(() => {
      wrapper.findComponent(FileList).vm.$emit('addToPlaylist', track);
    });

    it('calls the addToPlaylistModal function with the correct parameters', () => {
      expect(addToPlaylistModalMock).toHaveBeenCalledWith(track);
    });
  });

  describe('when the FileList component emits the addToQueue event', () => {
    beforeEach(() => {
      wrapper.findComponent(FileList).vm.$emit('addToQueue', track);
    });

    it('calls the addTrackToQueue function with the correct parameters', () => {
      expect(addTrackToQueueMock).toHaveBeenCalledWith(track);
    });
  });

  describe('when the FileList component emits the downloadMedia event', () => {
    beforeEach(() => {
      wrapper.findComponent(FileList).vm.$emit('downloadMedia', track);
    });

    it('calls the downloadTrack function with the correct parameters', () => {
      expect(downloadTrackMock).toHaveBeenCalledWith(track);
    });
  });

  describe('when the FileList component emits the mediaInformation event', () => {
    beforeEach(() => {
      wrapper.findComponent(FileList).vm.$emit('mediaInformation', track);
    });

    it('calls the openTrackDetailsModal function with the correct parameters', () => {
      expect(openTrackDetailsModalMock).toHaveBeenCalledWith(track);
    });
  });

  describe('when the FileList component emits the playTrack event', () => {
    beforeEach(() => {
      wrapper.findComponent(FileList).vm.$emit('playTrack', 1);
    });

    it('calls the playTracks function with the correct parameters', () => {
      expect(playTracksMock).toHaveBeenCalledWith(
        musicDirectoryDataMock.value.musicDirectory.tracks,
        1,
      );
    });
  });
});
