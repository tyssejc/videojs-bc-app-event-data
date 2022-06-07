import videojs from 'video.js';
import {version as VERSION} from '../package.json';
import window from 'global/window';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player object.
 *
 * @param    {Object} [options={}]
 *           A plain object containing options for the plugin.
 */
const onPlayerReady = (player, options) => {
  player.addClass('vjs-bc-app-event-data');
  let firststart = true;
  let firstplay = true;

  player.dataLayerPush = function(eventName, milestone) {

    // set whatever attributes for every event push
    const eventObject = {
      event: eventName,
      video: {
        videoName: player.mediainfo.name,
        secondsLength: player.duration(),
        videoID: player.mediainfo.id,
        videoPlayerType: 'brightcove'
      }
    };

    // set milestone for Milestone Reached event
    if (eventName === 'Video Milestone Reached') {
      eventObject.video.milestone = milestone;
    }

    const appEventData = window.appEventData || [];

    appEventData.push(eventObject);
  };

  // handle "loadedmetadata" bc player event
  player.on('loadedmetadata', function() {

    if (firststart) {
      firststart = false;
    }

  });

  // handle "play" bc player event
  player.on('play', function(e) {

    if (firstplay) {
      firstplay = false;
    }

    // push to appEventData data layer
    player.dataLayerPush('Video Started');

  });

  // handle "pause" bc player event
  player.on('pause', function(e) {

    // push to appEventData data layer
    player.dataLayerPush('Video Paused');

  });

  // handle "timeupdate" bc player event
  player.on('timeupdate', function(e) {

    const _currentTime = player.currentTime();
    const _duration = player.duration();
    const _milestoneReached = { 25: false, 50: false, 75: false };

    if ((_currentTime >= (_duration * 0.25) && _currentTime < (_duration * 0.49)) && !_milestoneReached[25]) {
      _milestoneReached[25] = true;
      player.dataLayerPush('Video Milestone Reached', '25');

    } else if ((_currentTime >= (_duration * 0.50) && _currentTime < (_duration * 0.74)) && !_milestoneReached[50]) {

      _milestoneReached[50] = true;
      player.dataLayerPush('Video Milestone Reached', '50');

    } else if ((_currentTime >= (_duration * 0.75) && _currentTime < (_duration * 0.99)) && !_milestoneReached[75]) {

      _milestoneReached[75] = true;
      player.dataLayerPush('Video Milestone Reached', '75');

    }

  });

  // handle "ended"
  player.on('ended', function(e) {

    // push to appEventData data layer
    player.dataLayerPush('Video Completed');

  });

};

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function bcAppEventData
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const bcAppEventData = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('bcAppEventData', bcAppEventData);

// Include the version number.
bcAppEventData.VERSION = VERSION;

export default bcAppEventData;
