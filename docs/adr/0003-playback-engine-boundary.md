# Playback Engine Boundary

VO Pads uses a Playback Engine boundary for the browser-local runtime that interprets Pad triggers and coordinates playback commands, readiness state, choke groups, priority ordering, and visible playback state.

The Player code previously mixed input policy, Pad-to-command translation, adapter events, DOM visibility, and player metadata updates in React components and DOM helpers. That made playback behavior hard to test without rendering local video or YouTube players.

We keep local video and YouTube players as adapters, and keep the existing event bus names for compatibility. The Playback Engine owns pure decisions: Pad input becomes `video:start`/`video:stop` commands, and player events become stack decisions such as show, hide, keep last visible, or stop another Pad in the same choke group. The DOM helpers remain an adapter that applies those decisions to rendered player elements.

The Playback Engine must stay browser-local. It must not add persistence, server playback, or media storage responsibilities.
