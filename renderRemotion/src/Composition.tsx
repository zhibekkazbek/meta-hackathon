import { useEffect, useState } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, Audio, OffthreadVideo, Sequence, staticFile, Img, delayRender, continueRender  } from 'remotion';
// import myImage from './assets/grad.png';
// import tengriLogo from './assets/logo.png';
import './MyComposition.css';

const bgSrc = staticFile('assets/grad.png');

interface MyCompositionProps {
  audioLink?: string
  subtitlesLink?: string
  videos?: {
    link: string,
    source: string,
    id: string,
    trimStart: number,
    trimEnd: number
  }[],
  leaderVideo?: string
}

interface Subtitle {
  start: number;
  end: number;
  text: string;
}

const parseSRT = (srt: string): Subtitle[] => {
  const regex = /(\d+)\r?\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\r?\n([\s\S]+?)(?=\r?\n\r?\n|$)/g;
  const subtitles: Subtitle[] = [];
  let match;
  while ((match = regex.exec(srt)) !== null) {
    const start = convertToSeconds(match[2]);
    const end = convertToSeconds(match[3]);
    const text = match[4].trim().replace(/<\/?[^>]+(>|$)/g, ""); // Remove any HTML tags
    subtitles.push({ start, end, text });
  }
  return subtitles;
};

const convertToSeconds = (time: string): number => {
  const [hours, minutes, seconds] = time.split(':');
  const [secs, ms] = seconds.split(',');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(secs) + Number(ms) / 1000;
};

export const MyComposition2: React.FC<MyCompositionProps> = ({audioLink, subtitlesLink, videos}) => {

  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { durationInFrames } = useVideoConfig();
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    const loadSubtitles = async () => {
      if (subtitlesLink) {
        const parsedSubtitles = parseSRT(subtitlesLink);
        setSubtitles(parsedSubtitles);
      }
    };

    const loadImage = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => reject();
      });
    };

    Promise.all([loadSubtitles(), loadImage(bgSrc)])
      .then(() => continueRender(handle))
      .catch((err) => console.error('Ошибка при загрузке ресурсов:', err));
  }, [subtitlesLink, handle]);

    
  const videoDurationPerClip = Math.floor((durationInFrames / videos!.length)) +1;
  const currentVideoIndex = Math.floor(frame / videoDurationPerClip);

  const currentTime = frame / fps;
  const currentSubtitle = subtitles.find(s => currentTime >= s.start && currentTime <= s.end);

  if (currentVideoIndex >= videos!.length) {
    return null;
  }


  return (
    <AbsoluteFill>

  <Sequence from={0} durationInFrames={durationInFrames}>
    <AbsoluteFill
      style={{
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        position: 'absolute',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
    </AbsoluteFill>
  </Sequence>

      {audioLink && <Audio src={ audioLink} />}

      {videos!.map((el, i) => {
        const startFrame = el.trimStart * fps;
        const endFrame = el.trimEnd * fps;

        return (
          frame >= startFrame &&
          frame < endFrame && (
            <Sequence from={startFrame} durationInFrames={endFrame - startFrame}>

              <OffthreadVideo
                key={i}
                muted
                src={staticFile(el.id)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />


              <AbsoluteFill style={{  alignItems: 'flex-end' }}>
                <h2 style={{ color: 'rgb(255,255,255)', fontSize: '20px', fontWeight: 'semibold', margin: '0', writingMode: 'vertical-rl', padding: '100px 30px', fontFamily: 'InterV'}}>
                  {el.source}
                </h2>
              </AbsoluteFill>
            </Sequence>

          )
        );
      })}

          <AbsoluteFill style={{
            backgroundImage: `url(${bgSrc})`,
            backgroundSize: 'cover',  // Покрытие всего экрана
            backgroundPosition: 'center',
          }} />
        
        {currentSubtitle && (
  <div
    style={{
      position: 'absolute',
      top: '900px', // Фиксированное положение внизу
      left: '40px', // Отступ от левого края
      width: '80%', // Чтобы текст не занимал всю ширину
      display: 'flex',
      alignItems: 'flex-start',
    }}
  >
    <h2
      style={{
        color: 'white',
        textAlign: 'left',
        lineHeight: '52px',
        fontSize: '45px',
        fontFamily: 'InterV',
        fontWeight: 'semibold',
        whiteSpace: 'pre-line', // Учитываем переносы строк
      }}
    >
      {currentSubtitle.text}
    </h2>
  </div>
)}




  </AbsoluteFill>
)}

//npx remotion lambda sites create src/index.ts --site-name=my-video