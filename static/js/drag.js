document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const gridSize = 20;

    cards.forEach(card => {
        const dragHandle = card.querySelector('.drag-handle');
        const resizeHandle = card.querySelector('.resize-handle');
        let isDragging = false;
        let isResizing = false;
        let initialX, initialY, offsetX, offsetY, initialWidth, initialHeight;

        // Dragging
        dragHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            initialX = e.clientX;
            initialY = e.clientY;
            offsetX = card.offsetLeft;
            offsetY = card.offsetTop;
            card.style.position = 'absolute';
            card.style.cursor = 'grabbing';
        });

        // Resizing
        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isResizing = true;
            initialX = e.clientX;
            initialY = e.clientY;
            initialWidth = card.offsetWidth;
            initialHeight = card.offsetHeight;
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - initialX;
                const dy = e.clientY - initialY;
                let newLeft = offsetX + dx;
                let newTop = offsetY + dy;

                // Snap to grid
                newLeft = Math.round(newLeft / gridSize) * gridSize;
                newTop = Math.round(newTop / gridSize) * gridSize;

                card.style.left = newLeft + 'px';
                card.style.top = newTop + 'px';
            }

            if (isResizing) {
                const dx = e.clientX - initialX;
                const dy = e.clientY - initialY;
                let newWidth = initialWidth + dx;
                let newHeight = initialHeight + dy;

                // Snap to grid
                newWidth = Math.round(newWidth / gridSize) * gridSize;
                newHeight = Math.round(newHeight / gridSize) * gridSize;

                card.style.width = newWidth + 'px';
                card.style.height = newHeight + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            isResizing = false;
            card.style.cursor = 'grab';
        });
    });
});