import BCNA_Icon from './icons/BCNA_Icon.png';
import Blueprint_Icon from './icons/blueprint_icon.png';
import Butterfly_Icon from './icons/butterfly_icon.png';
import { Link } from "react-router-dom"

export const Footer = () => {
  return (
    <footer className='font-sans leading-[19px] shadow-[0_-4px_4px_rgba(0,0,0,0.15)]'>
      <div className='flex mt-2'>
        <img
          src='/logo.png'
          alt="BCNA logo"
          className='w-[230px] h-[57px] ml-32'
        />
        <a 
          href="https://bcna.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-800"
        >
          <img
            src={BCNA_Icon}
            alt="BCNA icon"
            className='h-[70px] ml-[662px]'
          />
        </a>
        <Link 
          to="/"
          className="underline hover:text-blue-800"
        >
          <img
            src={Butterfly_Icon}
            alt="Butterfly icon"
            className='h-[71px] ml-6'
          />
        </Link>
        <a 
          href="https://blueprintboulder.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-blue-800"
        >
          <img
            src={Blueprint_Icon}
            alt="Blueprint icon"
            className='h-[81px] ml-6'
          />
        </a>
      </div>
      <div className='flex mt-2 py-[10px]'>
        <Link
          to='/contact'
          className='underline hover:text-blue-800'
        >
          <p className='ml-32'>
            Contact Us
          </p>
        </Link>
        <p className='ml-[820px]'>
          <a 
              href="https://www.instagram.com/bouldercountynatureassociation/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
            Instagram
          </a>
        </p>
        <p className='ml-7'>
          <a 
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
            Facebook
          </a>
        </p>
        <p className='ml-7'>
          <a 
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-800"
            >
            More
          </a>
        </p>
      </div>

      <hr className="bg-[#D9D9D9] mx-auto h-[1px] w-[1184px] mt-2" />

      <p className='text-center mt-3 mb-3 '>
        © 2023 Blueprint Boulder. All rights reserved | Sponsored by the Boulder County Nature Association
      </p>
    </footer>
  )
}
