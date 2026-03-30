import BCNA_Icon from "./icons/BCNA_Icon.png";
import Blueprint_Icon from "./icons/blueprint_icon.png";
import Butterfly_Icon from "./icons/butterfly_icon.png";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer class="text-taupe-700 p-5 bg-taupe-100 border-t border-taupe-200">
      <div class="rounded p-5 max-w-[1000px] mx-auto">
        <div class="flex justify-between">
          <div>
            <img src="/bcna_wordmark.png" height="100" />
            <h3>BOULDER COUNTY NATURE ASSOCIATION</h3>
            <p class="text-taupe-400">P.O. Box 493, Boulder, CO 80306</p>
          </div>
          <div class="flex flex-col">
            <h5 class="text-taupe-300 font-['Montserrat',sans-serif] m-0 mb-2.5">PAGES</h5>
            <a href="" class="text-taupe-700 no-underline text-lg font-['Playfair_Display',serif]">
              fireflies
            </a>
            <a href="" class="text-taupe-700 no-underline text-lg font-['Playfair_Display',serif]">
              wildlife
            </a>
            <a href="" class="text-taupe-700 no-underline text-lg font-['Playfair_Display',serif]">
              glossary
            </a>
            <a href="" class="text-taupe-700 no-underline text-lg font-['Playfair_Display',serif]">
              admin
            </a>
          </div>
          <div class="flex flex-col">
            <h5 class="text-taupe-300 font-['Montserrat',sans-serif] m-0 mb-2.5">RELATED WEBSITES</h5>
            <a href="" class="text-taupe-700 no-underline text-lg font-['Playfair_Display',serif]">
              main website
            </a>
          </div>
        </div>
        <hr class="border-none border-t border-taupe-200" />
        <div class="flex justify-between">
          <p>
            Made by{" "}
            <a href="https://blueprintboulder.org/" class="text-inherit no-underline hover:underline">
              Blueprint
            </a>
          </p>
          <div>
            {/* <a href="" class="text-taupe-700"><Icon name="mdi:facebook" size={40} color="inherit" /></a> */}
            {/* <a href="" class="text-taupe-700"><Icon name="mdi:instagram" size={40} color="inherit" /></a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};
