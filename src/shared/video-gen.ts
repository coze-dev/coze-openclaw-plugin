import type { Content, CozeConfig, Ratio, Resolution, VideoGenerationTask } from "coze-coding-dev-sdk";
import { createVideoGenerationClient } from "../client.js";

export type VideoGenerationInput = {
  prompt?: string;
  image?: string[];
  firstFrame?: string;
  lastFrame?: string;
  callbackUrl?: string;
  returnLastFrame?: boolean;
  model?: string;
  maxWaitTime?: number;
  resolution?: Resolution;
  ratio?: Ratio;
  duration?: number;
  watermark?: boolean;
  seed?: number;
  camerafixed?: boolean;
  generateAudio?: boolean;
  headers?: Record<string, string>;
};

export type VideoGenerationResult = {
  taskId: string;
  status: VideoGenerationTask["status"];
  videoUrl?: string;
  lastFrameUrl?: string;
  raw: VideoGenerationTask;
};

function isFailedTask(task: VideoGenerationTask): boolean {
  return task.status === "failed" || task.status === "cancelled";
}

function buildContent(input: VideoGenerationInput): Content[] {
  const content: Content[] = [];

  if (input.prompt) {
    content.push({
      type: "text",
      text: input.prompt,
    });
  }

  for (const imageUrl of input.image ?? []) {
    content.push({
      type: "image_url",
      image_url: { url: imageUrl },
      role: "reference_image",
    });
  }

  if (input.firstFrame) {
    content.push({
      type: "image_url",
      image_url: { url: input.firstFrame },
      role: "first_frame",
    });
  }

  if (input.lastFrame) {
    content.push({
      type: "image_url",
      image_url: { url: input.lastFrame },
      role: "last_frame",
    });
  }

  return content;
}

function getFailureMessage(task: VideoGenerationTask): string {
  return task.error_message || `Video generation failed with status: ${task.status}`;
}

export async function generateVideo(
  input: VideoGenerationInput,
  clientConfig: CozeConfig,
): Promise<VideoGenerationResult> {
  const content = buildContent(input);
  if (content.length === 0) {
    throw new Error("At least one text or image input is required for video generation");
  }

  const client = await createVideoGenerationClient({
    config: clientConfig,
    customHeaders: input.headers,
  });
  const response = await client.videoGeneration(content, {
    callbackUrl: input.callbackUrl,
    returnLastFrame: input.returnLastFrame,
    model: input.model,
    maxWaitTime: input.maxWaitTime,
    resolution: input.resolution,
    ratio: input.ratio,
    duration: input.duration,
    watermark: input.watermark,
    seed: input.seed,
    camerafixed: input.camerafixed,
    generateAudio: input.generateAudio,
  });

  if (!response.response.id) {
    throw new Error("Video generation did not return a task id");
  }

  if (!response.videoUrl && isFailedTask(response.response)) {
    throw new Error(getFailureMessage(response.response));
  }

  return {
    taskId: response.response.id,
    status: response.response.status,
    videoUrl: response.videoUrl || undefined,
    lastFrameUrl: response.lastFrameUrl || undefined,
    raw: response.response,
  };
}
