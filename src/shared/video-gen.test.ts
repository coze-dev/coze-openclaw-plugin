import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  createVideoGenerationClient: vi.fn(),
}));

vi.mock("../client.js", () => ({
  createVideoGenerationClient: (...args: unknown[]) => hoisted.createVideoGenerationClient(...args),
}));

const { generateVideo } = await import("./video-gen.js");

describe("generateVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects empty content before calling the sdk", async () => {
    await expect(generateVideo({}, { apiKey: "test-key" })).rejects.toThrow(
      "At least one text or image input is required for video generation",
    );
    expect(hoisted.createVideoGenerationClient).not.toHaveBeenCalled();
  });

  it("forwards text and frame inputs plus options to the sdk wrapper", async () => {
    const client = {
      videoGeneration: vi.fn().mockResolvedValue({
        videoUrl: "https://example.com/video.mp4",
        lastFrameUrl: "https://example.com/last-frame.png",
        response: {
          id: "task-1",
          status: "succeeded",
          content: {
            video_url: "https://example.com/video.mp4",
            last_frame_url: "https://example.com/last-frame.png",
          },
        },
      }),
    };
    hoisted.createVideoGenerationClient.mockResolvedValue(client);

    const result = await generateVideo(
      {
        prompt: "animate this scene",
        image: ["https://example.com/reference.png"],
        firstFrame: "https://example.com/first.png",
        lastFrame: "https://example.com/last.png",
        model: "doubao-seedance-1-5-pro-251215",
        duration: 6,
        ratio: "9:16",
        resolution: "1080p",
        watermark: false,
        seed: 42,
        camerafixed: true,
        generateAudio: false,
        returnLastFrame: true,
        maxWaitTime: 300,
        callbackUrl: "https://example.com/callback",
        headers: { "x-run-mode": "test_run" },
      },
      { apiKey: "test-key" },
    );

    expect(hoisted.createVideoGenerationClient).toHaveBeenCalledWith({
      config: { apiKey: "test-key" },
      customHeaders: { "x-run-mode": "test_run" },
    });
    expect(client.videoGeneration).toHaveBeenCalledWith(
      [
        { type: "text", text: "animate this scene" },
        {
          type: "image_url",
          image_url: { url: "https://example.com/reference.png" },
          role: "reference_image",
        },
        {
          type: "image_url",
          image_url: { url: "https://example.com/first.png" },
          role: "first_frame",
        },
        {
          type: "image_url",
          image_url: { url: "https://example.com/last.png" },
          role: "last_frame",
        },
      ],
      {
        model: "doubao-seedance-1-5-pro-251215",
        duration: 6,
        ratio: "9:16",
        resolution: "1080p",
        watermark: false,
        seed: 42,
        camerafixed: true,
        generateAudio: false,
        returnLastFrame: true,
        maxWaitTime: 300,
        callbackUrl: "https://example.com/callback",
      },
    );
    expect(result).toEqual({
      taskId: "task-1",
      status: "succeeded",
      videoUrl: "https://example.com/video.mp4",
      lastFrameUrl: "https://example.com/last-frame.png",
      raw: {
        id: "task-1",
        status: "succeeded",
        content: {
          video_url: "https://example.com/video.mp4",
          last_frame_url: "https://example.com/last-frame.png",
        },
      },
    });
  });

  it("throws when the sdk does not return a video url", async () => {
    const client = {
      videoGeneration: vi.fn().mockResolvedValue({
        videoUrl: null,
        lastFrameUrl: "",
        response: {
          id: "task-2",
          status: "failed",
          error_message: "bad request",
        },
      }),
    };
    hoisted.createVideoGenerationClient.mockResolvedValue(client);

    await expect(generateVideo({ prompt: "fail please" }, { apiKey: "test-key" })).rejects.toThrow(
      "bad request",
    );
  });
});
