import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-text">
        <p>Copyright &copy; 2024 by NJS1804 - Team3 | All Rights Reserved.</p>
      </div>
      <div className="footer-iconTop" style={{ fontSize: "2rem" }}>
        <a 
          style={{
            padding: "1rem 1.2rem",
            borderRadius: "50%",
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            cursor: "pointer"
          }} 
          onClick={scrollToTop}
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;