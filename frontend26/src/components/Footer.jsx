import BCNA_Icon from "./icons/BCNA_Icon.png";
import Blueprint_Icon from "./icons/blueprint_icon.png";
import Butterfly_Icon from "./icons/butterfly_icon.png";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="p-5 border-t text-sand-600 bg-sand-100 border-sand-200">
      <div className="rounded p-5 max-w-[1000px] mx-auto">
        <div className="flex justify-between">
          <div>
            <img src="/bcna_wordmark.png" height="100" />
            <h3 className="font-bold">BOULDER COUNTY NATURE ASSOCIATION</h3>
            <p className="text-sand-400">P.O. Box 493, Boulder, CO 80306</p>
          </div>
          <div className="flex flex-col">
            <h5 className="text-sand-300 font-sans m-0 mb-2.5 font-bold">PAGES</h5>
            <a href="" className="font-serif text-lg no-underline text-sand-700">
              fireflies
            </a>
            <a href="" className="font-serif text-lg no-underline text-sand-700">
              wildlife
            </a>
            <a href="" className="font-serif text-lg no-underline text-sand-700">
              glossary
            </a>
            <a href="" className="font-serif text-lg no-underline text-sand-700">
              admin
            </a>
          </div>
          <div className="flex flex-col">
            <h5 className="text-sand-300 font-sans m-0 mb-2.5 font-bold">RELATED WEBSITES</h5>
            <a href="" className="font-serif text-lg no-underline text-sand-700">
              main website
            </a>
          </div>
        </div>
        <hr className="my-8 border-t border-sand-200" />
        <div className="flex justify-between">
          <p>
            Made by{" "}
            <a href="https://blueprintboulder.org/" className="no-underline text-inherit hover:underline">
              Blueprint
            </a>
          </p>
          <div>
            {/* <a href="" className="text-sand-700"><Icon name="mdi:facebook" size={40} color="inherit" /></a> */}
            {/* <a href="" className="text-sand-700"><Icon name="mdi:instagram" size={40} color="inherit" /></a> */}
          </div>
        </div>
      </div>
    </footer>
  );
};
