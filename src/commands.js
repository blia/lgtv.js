module.exports = {
  setVolume(volume) {
    return {
      uri: 'ssap://audio/setVolume',
      type: 'request',
      payload: { volume }
    };
  },
  getVolume(listener) {
    if (typeof listener === 'function') {
      return {
        uri: 'ssap://audio/getVolume',
        type: 'subscribe',
        listener
      };
    } else {
      return {
        uri: 'ssap://audio/getVolume',
        type: 'request'
      };
    }
  }
};

const commands = {
  switchInput: 'ssap://tv/switchInput',
  getInputs: 'ssap://tv/getExternalInputList',
  // ssap://tv/getCurrentChannel
  // ssap://tv/getChannelProgramInfo
  // ssap://tv/getChannelProgramInfo

  launchApp: 'ssap://system.launcher/launch',
  createToast: 'ssap://system.notifications/createToast',
  // ssap://system.launcher/getAppState

  setVolume: 'ssap://audio/setVolume',

  getApps: 'ssap://com.webos.applicationManager/listLaunchPoints',
  // ssap://com.webos.applicationManager/getForegroundAppInfo

  // ssap://com.webos.service.appstatus/getAppStatus

  getServices: 'ssap://api/getServiceList'

  // ssap://media.viewer/close

  // ssap://webapp/closeWebApp
};

// createToast(message) {
//     return this.send(commands.createToast, { message });
//   }

//   getInputs() {
//     return this.send(commands.getInputs).then(({ payload }) => {
//       let { devices } = payload;
//       return devices;
//     });
//   }

//   launchApp(id, params = null) {
//     return this.send(commands.launchApp, { id, params });
//   }

//   getServices() {
//     return this.send(commands.getServices);
//   }

//   getApps() {
//     return this.send(commands.getApps);
//   }

//   setInput(inputId) {
//     return this.send(commands.switchInput, { inputId });
//   }

//   setVolume(volume) {
//     return this.send(commands.setVolume, { volume });
//   }

//   launchYoutube(contentTarget) {
//     return this.launchApp('youtube.leanback.v4', { contentTarget });
//   }
