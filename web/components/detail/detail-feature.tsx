'use client';

import Image from "next/image";
import detail from '../../public/detail.jpg';
export default function DetailFeature() {
  return (

    <div className='container w-full h-full mx-auto'>
      <Image src={detail} alt="Solana Logo" className="w-full h-full" />
    </div>

  );
}
