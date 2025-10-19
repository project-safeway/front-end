import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <div className="footer-logo"></div>
          <div>
            <h3>SafeWay</h3>
            <p>Conectando famílias à tranquilidade.</p>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <h4>Informação</h4>
            <a href="#">Link</a>
            <a href="#">Link</a>
            <a href="#">Link</a>
          </div>
          <div>
            <h4>Informação</h4>
            <a href="#">Link</a>
            <a href="#">Link</a>
            <a href="#">Link</a>
          </div>
          <div>
            <h4>Informação</h4>
            <a href="#">Link</a>
            <a href="#">Link</a>
            <a href="#">Link</a>
          </div>
        </div>
      </div>

      <hr />
      <p className="footer-copy">
        SPTECH - SafeWay © Todos os direitos reservados
      </p>
    </footer>
  );
}
