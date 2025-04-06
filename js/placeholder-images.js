// Placeholder Images for Development
document.addEventListener('DOMContentLoaded', function() {
    // Create CSS for placeholder images
    const style = document.createElement('style');
    style.textContent = `
        .placeholder-image {
            position: relative;
            background-color: #f8f9fa;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-family: 'Inter', sans-serif;
        }
        
        .placeholder-image::before {
            content: "";
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(13, 85, 234, 0.2), rgba(0, 218, 235, 0.2));
        }
        
        .placeholder-image span {
            position: relative;
            padding: 1rem;
            text-align: center;
            font-weight: 500;
            z-index: 1;
            background-color: rgba(255, 255, 255, 0.8);
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
    `;
    document.head.appendChild(style);
    
    // Replace missing carousel images
    const carouselItems = document.querySelectorAll('.carousel-item img');
    carouselItems.forEach((img, index) => {
        if (!img.complete || img.naturalHeight === 0) {
            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'placeholder-image d-block w-100';
            placeholderDiv.style.height = '100vh';
            
            const textSpan = document.createElement('span');
            textSpan.textContent = 'Slide ' + (index + 1) + ' - Add your image here';
            placeholderDiv.appendChild(textSpan);
            
            img.parentNode.replaceChild(placeholderDiv, img);
        }
    });
    
    // Replace missing app screenshot
    const appScreenshot = document.querySelector('.app-image');
    if (appScreenshot && (!appScreenshot.complete || appScreenshot.naturalHeight === 0)) {
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'placeholder-image app-image';
        placeholderDiv.style.height = '500px';
        placeholderDiv.style.width = '100%';
        
        const textSpan = document.createElement('span');
        textSpan.textContent = 'App Screenshot - Add your image here';
        placeholderDiv.appendChild(textSpan);
        
        appScreenshot.parentNode.replaceChild(placeholderDiv, appScreenshot);
    }
});