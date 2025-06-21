import { Composition } from "remotion";
import { MyComposition2 } from "./Composition";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from 'remotion';

interface MyCompositionProps {
  audioLink?: string
  subtitlesLink?: string
  videos?: {
    link: string,
    source: string,
    trimStart: number, 
    trimEnd: number
  }[],
  leaderVideo?: string
}
export const RemotionRoot: React.FC<MyCompositionProps> = (inputProps) => {
  const fps = 30

  const calculateMetadata = async ({ props }: { props: MyCompositionProps }) => {
    if (!props.audioLink) {
      throw new Error('audioLink is required');
    }

    // Convert the audioLink to a static file path
    const audioPath = staticFile(props.audioLink);

    // Get the duration of the audio file
    const duration = await getAudioDurationInSeconds(audioPath);

    return {
      durationInFrames: Math.ceil(duration * fps) + 4,
      props: {
        ...props,
        audioLink: audioPath, // Update the audioLink to the static file path
      },
    };
  };

  return (
    <>
      <Composition
        id="MyComp2"
        component={MyComposition2}
        fps={fps}
        width={720}
        height={1280}
        // durationInFrames={300}
        defaultProps={inputProps}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
