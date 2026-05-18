# VO Pads

VO Pads is a browser-local performance tool for arranging video and image sources onto triggerable pads, then playing or sequencing those pads during a live set.

## Language

**Project**:
A local saved performance setup containing pads, sequencing, presentation settings, and metadata.
_Avoid_: Document, session

**Pad**:
A triggerable slot whose configuration determines what plays when triggered.
_Avoid_: Clip, button

**Media Source**:
An assignable input for a pad, such as a YouTube URL or ID, local file, pasted image, or future provider URL.
_Avoid_: Source, clip

**Media**:
Resolved metadata and stored data derived from a Media Source.
_Avoid_: Source

## Relationships

- A **Project** contains multiple **Pads**.
- A **Pad** may have zero or one active **Media Source**.
- A **Media Source** resolves to **Media** before playback, thumbnailing, or persistence.

## Example dialogue

> **Dev:** "When a performer drops a local video onto a **Pad**, should we save the file directly on the pad?"
> **Domain expert:** "No - the dropped file is the **Media Source**. Resolve it to **Media**, persist that browser-locally, then assign the source to the **Pad** inside the **Project**."

## Flagged ambiguities

- "source" was used to mean both the assignable **Media Source** and the resolved **Media**. Resolved: use **Media Source** for the input assigned to a pad, and **Media** for resolved metadata/stored data.
