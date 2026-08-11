import { useMemo, useState } from 'react';

interface YouTubeVideo {
  id: string;
  url: string;
  title?: string;
}

interface SimpleYouTubePlayerProps {
  videos: YouTubeVideo[];
}

function getVideoId(videoUrl: string) {
  return videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
}

export function SimpleYouTubePlayer({ videos }: SimpleYouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const video = videos[0];
  const embedUrl = useMemo(() => {
    if (!video) return '';
    return `https://www.youtube.com/embed/${getVideoId(video.url)}?autoplay=1&controls=0&rel=0&modestbranding=1`;
  }, [video]);

  if (!video) return null;

  return (
    <>
      {isPlaying && (
        <iframe
          src={embedUrl}
          className="audio-player-frame"
          allow="autoplay; encrypted-media"
          title={video.title ?? 'YouTube audio player'}
        />
      )}
      <button
        type="button"
        onClick={() => setIsPlaying((playing) => !playing)}
        className="panel-action audio-player-button"
        aria-label={isPlaying ? 'Stop music' : 'Play LoFi Girl hip hop radio'}
      >
        <span aria-hidden="true">{isPlaying ? '■' : '▶'}</span>
        {isPlaying ? 'Stop music' : 'Play LoFi Girl'}
      </button>
    </>
  );
}
