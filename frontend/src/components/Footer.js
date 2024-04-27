import './FooterStyles.css';
import BCNA_Icon from './icons/BCNA_Icon.png';
import Blueprint_Icon from './icons/blueprint_icon.png';
import Butterfly_Icon from './icons/butterfly_icon.png';

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-heading">Colorado Front Range Butterflies</div>
        <div className="footer-row">
          <div className="footer-column">
            <h3>Who Are We</h3>
            <ul>
              <li><a href="https://www.instagram.com/bouldercountynatureassociation/" className="footer-link">Instagram</a></li>
              <li><a href="#" className="footer-link">Social 2</a></li>
              <li><a href="#" className="footer-link">Social 3</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Pages</h3>
            <ul>
              <li><a href="#" className="footer-link">Home</a></li>
              <li><a href="#" className="footer-link">About</a></li>
              <li><a href="#" className="footer-link">Wildlife</a></li>
              <li><a href="#" className="footer-link">Checklists</a></li>
              <li><a href="#" className="footer-link">Resources</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul>
              <li><a href="#" className="footer-link">Contact BCNA</a></li>
            </ul>
          </div>
        </div>
      <div className="footer-image-container">
        <div className="footer-row">
          <div className="footer-column">
            <ul>
              <li><img src={BCNA_Icon} alt="BCNA Icon" /></li>
            </ul>
          </div>
        <div className="footer-column">
          <ul>
            <li><img src={Butterfly_Icon} alt="BCNA Icon" /></li>
          </ul>
        </div>
        <div className="footer-column">
            <ul>
              <li><img src={Blueprint_Icon} alt="BCNA Icon" /></li>
            </ul>
          </div>
      </div>
      </div>
      <div className="footer-bottom-container">
        <p className="footer-bottom-text">© 2023 Blueprint Boulder. All rights reserved | Sponsored by the Boulder County Nature Association</p>
      </div>
    </footer>
  );
};