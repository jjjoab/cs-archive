import React from 'react';
import { useAudio } from './AudioProvider';

const AudioPlayer: React.FC = () => {
	const { activeMix } = useAudio();

	if (activeMix === null) return null;

	const formattedDate = activeMix.date
		? new Date(activeMix.date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		: '';
	const marqueeText = [
		activeMix.event,
		formattedDate,
		activeMix.artists,
		activeMix.roomLabel,
	]
		.filter(Boolean)
		.join(' • ');

   
	return (
		<div className="soundcloud-embed">
			<iframe
				width="100%"
				height="20"
				scrolling="no"
				frameBorder="no"
				allow="autoplay"
				src={activeMix.url}
			></iframe>
			{marqueeText && (
				<div className="audio-marquee" aria-label={marqueeText}>
					<div className="audio-marquee-track">
						<span>{marqueeText}</span>
						<span aria-hidden="true">{marqueeText}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default AudioPlayer;



{/* <div className="soundcloud-embed">
        <iframe width="100%" height="20" scrolling="no" frameBorder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/soundcloud%253Atracks%253A1511000041&color=%230a26f0&inverse=true&auto_play=false&show_user=true"></iframe>
        <div style={{fontSize: '10px', color: '#cccccc', lineBreak: 'anywhere', wordBreak: 'normal', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontFamily: 'Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif', fontWeight: 100}}>
          <a href="https://soundcloud.com/warecollective" title="WARE" target="_blank" style={{color: '#cccccc', textDecoration: 'none'}}>WARE</a> · <a href="https://soundcloud.com/warecollective/wavm8s-068-robek" title="WAV.M8's 068 - Robek" target="_blank" style={{color: '#cccccc', textDecoration: 'none'}}>WAV.M8's 068 - Robek</a>
        </div>
      </div> */}
