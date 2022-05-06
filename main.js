import "./css/reset.css";
import "./css/global.css";
import "./css/home.css";

document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) { event.preventDefault(); }
  }, false);
