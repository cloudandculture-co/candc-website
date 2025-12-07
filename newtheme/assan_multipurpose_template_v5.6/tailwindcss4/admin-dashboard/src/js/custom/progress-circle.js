document.addEventListener('DOMContentLoaded', function() {
    const progressContainers = document.querySelectorAll('.js-progress');

    progressContainers.forEach(container => {
        const progressValue = container.getAttribute('data-progress');
        const progressBar = container.querySelector('.progress-bar');
        const progressValueText = container.querySelector('.progress-value-text');

        progressValueText.textContent = progressValue;
        const dashArrayValue = `${progressValue}, 100`;
        progressBar.setAttribute('stroke-dasharray', dashArrayValue);
    });
});