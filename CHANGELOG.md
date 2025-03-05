# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## Unreleased


### Fixed
- interval editor disabled when pad is empty


## v1.4.1 (2025-03-05)

### Changed
- turning one shot off will stop the pad if it is playing

### Added
- player debug modal

### Fixed
- player ordering incorrect with one-shot/loop



## v1.4.0 (2025-03-04)

### Changed
- interval editor has shading to indicate time segments

### Fixed
- local player not restarting when oneshot/loop enabled



## v1.3.4 (2025-02-28)

### Changed
- play btn only active if there is sequencer data
  
### Fixed
- Pad Label button not losing focus after close


## v1.3.3 (2025-02-25)

### Added
- landing page shout outs


## v1.3.2 (2025-02-25)

### Fixed
- occasional server crash due to half-baked i18n impl


## v1.3.1 (2025-02-25)

### Fixed
- yt pad thumbnail not shown on add
- yt start time not being set

### Changed
- support mp4 in project image (not shareable via social graph!)


## v1.3.0 (2025-02-24)

### Changed
- switched from static build to allow generation of open graph from import url
- time input fine control via up/down arrows and alt/shift/meta keys


## v1.2.4 (2025-02-21)

### Added
- step sequencer time display

### Changed
- time sequencer pane layout
- increased max length of pad label


## v1.2.3 (2025-02-21)

### Added
- step sequencer pad will now show a pulse when a pad is playing

### Changed
- fractional bpm allowed in step sequencer

### Fixed
- step sequencer stop doesnt stop playing pads



## v1.2.2 (2025-02-20)

### Fixed
- step sequencer pattern not changing during playback
  

## v1.2.1 (2025-02-20)

### Added
- step sequencer controls for manipulating patterns
- step sequencer pad hover to show pad and step


## v1.2.0 (2025-02-20)

### Added
- step sequencer
- top level play button - plays/stops all sequencers

### Changed
- last player will hide after a delay (if hideOnPlayerEnd is disabled)

### Fixed
- paste in select source modal text input is overriden by pad paste
  

## v1.1.3 (2025-02-16)

### Changed
- pad error shows as icon, with tooltip text on hover
- landing page updated with new info


## v1.1.2 (2025-02-16)

### Added
- keyboard shortcuts for one-shot, loop and resume
- keyboard settings (read only atm)

### Changed
- setting pad interval start time to same as end will bump the end so the duration remains the same
- events added to sequencer will now use the pad duration
- pad interval updated as the player is playing

### Fixed
- pad thumbnail not updating when source added



## v1.1.1 (2025-02-13)

### Changed
- moved delete all data to settings modal
- settings are persisted outside of projects
- improved landscape layout


## v1.1.0 (2025-02-12)

### Added
- added ability to set a project bg image
- sequencer events can now be copied
- YT videos that error on load show a error message

### Fixed
- sequencer playhead reverted to 0 on entry
- sequencer events during recording not showing until ended
- small screen layout issues
- one-shot pads are stopped when sequenced
- sequencer stops when esc is pressed

### Removed
- dedicated control pane for pad clipboard actions




## v1.0.0 (2025-02-11)

### Added
- initial public release
