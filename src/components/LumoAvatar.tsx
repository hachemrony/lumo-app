import React from 'react';
import Lottie from 'lottie-react';
import lumoCharacter from '../assets/lottie/lumo-character.json';

export default function LumoAvatar() {
  return (
    <div style={{ width: 200, margin: '0 auto' }}>
      <Lottie animationData={lumoCharacter} loop autoplay />
    </div>
  );
}
