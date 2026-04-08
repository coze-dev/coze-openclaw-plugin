---
name: coze-video-gen
description: Generate a video from text prompts and/or image inputs using Coze video generation. Use when you need text-to-video, image-to-video, first-frame control, last-frame control, or a returned last-frame image URL.
homepage: https://www.coze.com
metadata: { "openclaw": { "emoji": "🎬", "requires": { "bins": ["node"], "config": ["plugins.entries.coze-openclaw-plugin.config.apiKey"] } } }
---

# Coze Video Generation

Generate a video URL from text and image inputs using Coze.

This skill runs as a Node CLI wrapper around the backend SDK. Do not use the SDK from client-side code.

## Quick start

```bash
node {skillDir}/scripts/gen.mjs --prompt "A serene mountain landscape with flowing clouds"
node {skillDir}/scripts/gen.mjs --prompt "A cinematic robot walking through neon rain" --duration 6 --ratio 9:16 --resolution 1080p
node {skillDir}/scripts/gen.mjs --prompt "Animate this concept art" --first-frame "https://example.com/first.png"
node {skillDir}/scripts/gen.mjs --prompt "Transition from sunrise to night" --first-frame "https://example.com/start.png" --last-frame "https://example.com/end.png" --return-last-frame true
node {skillDir}/scripts/gen.mjs --prompt "Stylized motion study" --image "https://example.com/reference-1.png" --image "https://example.com/reference-2.png"
```

## Options

- `--prompt <text>` text prompt
- `--image <url>` reference image URL; repeat the flag to pass multiple images
- `--first-frame <url>` first frame image URL
- `--last-frame <url>` last frame image URL
- `--model <id>` model id, default SDK model is `doubao-seedance-1-5-pro-251215`
- `--duration <seconds>` video duration in seconds
- `--ratio <ratio>` one of `16:9`, `9:16`, `1:1`, `4:3`, `3:4`, `21:9`, `adaptive`
- `--resolution <value>` one of `480p`, `720p`, `1080p`
- `--watermark <true|false>` whether to keep watermark
- `--seed <n>` fixed random seed for reproducibility
- `--camera-fixed <true|false>` whether to fix the camera
- `--generate-audio <true|false>` whether to generate synced audio
- `--return-last-frame <true|false>` whether to return the last-frame image URL
- `--max-wait-time <seconds>` max synchronous wait time
- `--callback-url <url>` async callback URL passed through to the SDK
- `--header <key:value>` custom HTTP header; repeatable, alias `-H`

## Behavior

- At least one of `--prompt`, `--image`, `--first-frame`, or `--last-frame` is required.
- Successful runs print `Task ID`, `Status`, `Video URL`, and optionally `Last Frame URL`.
- The CLI does not download video files locally.
- Printed video URLs and frame URLs must be kept exactly intact, complete, and accurate. All URL parameters must be preserved without truncation, rewriting, omission, or reordering; in particular, parameters inside the query string such as `sign` must not be dropped, otherwise the asset may be inaccessible.
- Unless the user explicitly asks to download the URL content, only return the complete URL link to the user.

## Notes

- The skill runtime requires `plugins.entries.coze-openclaw-plugin.config.apiKey`.
- `{skillDir}` means the directory containing this `SKILL.md`.
- The default model `doubao-seedance-1-5-pro-251215` supports text input plus `first_frame` and `last_frame`. Generic `reference_image` inputs from `--image` may be rejected by that model.
- The returned video URL is already hosted with a valid expiration period. Unless the user explicitly needs rehosting or download, use it directly.
