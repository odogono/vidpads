# Vid-Wiz



## Overview

- Inspired by Koala Sampler


- it is a single page app which is built to allow processing of video files using ffmpeg.wasm
- the page should show an area onto which a video can be dropped
- when a video is dropped, it should be added to ffmpeg.wasm and a video player should be shown
- the video player should have a button to play/pause the video
- the video player should have a button to download the video


features:
- For video editing, can you put basic text/etc over the video? Ie gifs + text? A refined UX for going from screen capture to stupid gif, on Linux and Windows, would easily be something i'd pay for
- resize video using a rectangle selector, either maintaining aspect ratio or not
- trim video start and end



drag an image onto a tile
set a duration
set a video size (defaults to the original image size)

when an image is dropped onto a tile, it creates a new sequence of operations, with the the image as the first operation
a sequence of operation could also be called a "recipe"


https://ffmpegwasm.netlify.app/docs/overview

https://github.com/ffmpegwasm/ffmpeg.wasm/tree/main/apps/react-vite-app




## Create a video from an image

Here are the main ways to create a video from an image using FFmpeg:

1. Basic method (5 second duration):
```bash
ffmpeg -loop 1 -i input.jpg -c:v libx264 -t 5 output.mp4
```

2. Higher quality version:
```bash
ffmpeg -loop 1 -i input.jpg \
    -c:v libx264 \
    -t 5 \
    -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    -preset veryslow \
    -crf 18 \
    output.mp4
```

Key parameters:
- `-loop 1`: Enables image looping
- `-t 5`: Sets duration to 5 seconds
- `-pix_fmt yuv420p`: Ensures compatibility with most players
- `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"`: Ensures dimensions are even (required by some codecs)

If you want to set a specific framerate:
```bash
ffmpeg -loop 1 -i input.jpg -c:v libx264 -t 5 -r 30 output.mp4
```

Would you like me to explain how to add transitions or effects to this static video?



## Resize a video


Here are the main ways to resize a video with FFmpeg:

1. Scale to a specific size (e.g., 1280x720):
```bash
ffmpeg -i input.mp4 -vf "scale=1280:720" -c:a copy output.mp4
```

2. Scale width, maintain aspect ratio:
```bash
ffmpeg -i input.mp4 -vf "scale=1280:-1" -c:a copy output.mp4
```

3. Scale height, maintain aspect ratio:
```bash
ffmpeg -i input.mp4 -vf "scale=-1:720" -c:a copy output.mp4
```

4. Scale to fit within dimensions (useful for mixed aspect ratios):
```bash
ffmpeg -i input.mp4 -vf "scale=1280:720:force_original_aspect_ratio=decrease" -c:a copy output.mp4
```

5. Scale by a factor (e.g., make video half size):
```bash
ffmpeg -i input.mp4 -vf "scale=iw/2:ih/2" -c:a copy output.mp4
```

The `-c:a copy` flag preserves the original audio without re-encoding.

You can also add flags for better quality:
```bash
ffmpeg -i input.mp4 -vf "scale=1280:720" -c:v libx264 -preset slow -crf 18 -c:a copy output.mp4
```

Would you like me to explain any specific scaling method in more detail?





## Remove audio from a video

Here are the main ways to remove audio from a video using FFmpeg:

1. Simplest method (copy video stream, drop audio):
```bash
ffmpeg -i input.mp4 -c:v copy -an output.mp4
```

2. Alternative method using `-map` (more explicit):
```bash
ffmpeg -i input.mp4 -map 0:v -c:v copy output.mp4
```

Key parameters explained:
- `-an`: Removes all audio streams
- `-c:v copy`: Copies video stream without re-encoding
- `-map 0:v`: Explicitly maps only the video stream from first input

Both methods are fast since they don't re-encode the video, just strip the audio.

If you need to process the video for other reasons, you can combine this with other operations:
```bash
ffmpeg -i input.mp4 -vf "scale=1280:720" -an output.mp4
```

Would you like to know how to remove audio from specific portions of the video instead of the entire video?



## Resize a video and pad it with a black background to reach a specific size

```bash
# 1. Basic padding to specific size (centers the video)
ffmpeg -i input.mp4 \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:black" \
    -c:a copy \
    output.mp4

# 2. Scale video first, then add padding (more control)
ffmpeg -i input.mp4 \
    -vf "scale=1280:720,pad=1920:1080:320:180:black" \
    -c:a copy \
    output.mp4

# 3. Scale maintaining aspect ratio with padding
ffmpeg -i input.mp4 \
    -vf "scale=-1:720:force_original_aspect_ratio=maintain,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black" \
    -c:a copy \
    output.mp4

# Parameters explained:
# scale=width:height - Resize the video
# pad=width:height:x:y:color - Add padding
#   - width/height: final dimensions
#   - x/y: position of original video (calculations for center)
#   - color: padding color (can use 'black', hex values, etc.)

# 4. High quality version with manual positioning
ffmpeg -i input.mp4 \
    -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1920:1080:320:180:black" \
    -c:v libx264 \
    -preset slow \
    -crf 18 \
    -c:a copy \
    output.mp4

```

The key parts are:

1. `scale`: Resizes the video first
   - Use `force_original_aspect_ratio=decrease` to prevent stretching
   - Or `-1` to maintain aspect ratio for one dimension

2. `pad`: Adds the black background
   - First two numbers are final width/height
   - Next two numbers are X/Y position
   - Last parameter is color (black in this case)

For centering calculation:
- X position: `(ow-iw)/2` (output width minus input width divided by 2)
- Y position: `(oh-ih)/2` (output height minus input height divided by 2)

You can also use specific positions instead of centering:
```bash
# Put video at top-left
ffmpeg -i input.mp4 -vf "scale=1280:720,pad=1920:1080:0:0:black" -c:a copy output.mp4

# Put video at bottom-right
ffmpeg -i input.mp4 -vf "scale=1280:720,pad=1920:1080:640:360:black" -c:a copy output.mp4
```

Would you like me to explain how to use different padding colors or how to position the video in specific locations?