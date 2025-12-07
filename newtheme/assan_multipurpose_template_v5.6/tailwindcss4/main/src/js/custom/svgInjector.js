(function() {
    function loadSVG(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 400) {
                callback(null, xhr.responseXML.documentElement);
            } else {
                callback(new Error(`Failed to load SVG: ${xhr.status}`));
            }
        };
        xhr.onerror = function() {
            callback(new Error("Network error while loading SVG"));
        };
        xhr.send();
    }
    function injectSVG(element) {
        const svgSrc = element.getAttribute("data-src");
        const fillColor = element.getAttribute("data-fill");
        const strokeColor = element.getAttribute("data-stroke");

        if (!svgSrc) {
            console.error("No SVG source provided in data-src attribute.");
            return;
        }

        loadSVG(svgSrc, function(error, svg) {
            if (error) {
                console.error(error);
                return;
            }
            if (fillColor) {
                const paths = svg.querySelectorAll("path, rect, circle, polygon, polyline, ellipse, line");
                paths.forEach(function(path) {
                    path.setAttribute("fill", fillColor);
                });
            }
            if (strokeColor) {
                const paths = svg.querySelectorAll("path, rect, circle, polygon, polyline, ellipse, line");
                paths.forEach(function(path) {
                    path.setAttribute("stroke", strokeColor);
                });
            }
            element.innerHTML = "";
            element.appendChild(svg);
        });
    }document.addEventListener("DOMContentLoaded", function() {
        const svgContainers = document.querySelectorAll(".svg-container");
        svgContainers.forEach(function(container) {
            injectSVG(container);
        });
    });
})();
