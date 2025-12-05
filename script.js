// Brand data
const brands = [
    { img: "photos/adidas.webp", title: "Adidas" },
    { img: "photos/asics.webp", title: "Asics" },
    { img: "photos/calvin-klein.webp", title: "Calvin Klein" },
    { img: "photos/decathlon.webp", title: "Decathlon" },
    { img: "photos/fila.webp", title: "Fila" },
    { img: "photos/new-balance.webp", title: "New Balance" },
    { img: "photos/nike.webp", title: "Nike" },
    { img: "photos/puma.webp", title: "Puma" },
    { img: "photos/salomon.webp", title: "Salomon" }
];

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

function initApp() {
    const listEl = document.getElementById('brandList');
    const previewEl = document.getElementById('brandPreview');
    const indicatorEl = document.getElementById('scrollIndicator');

    // Render brand names
    brands.forEach((brand, index) => {
        const brandLink = document.createElement('a');
        brandLink.href = '#';
        brandLink.className = 'brand-name';
        brandLink.textContent = brand.title;
        brandLink.dataset.index = index;
        listEl.appendChild(brandLink);
    });

    // Render scroll indicator dots
    brands.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = 'scroll-dot';
        dot.style.width = '10px';
        dot.style.height = '1px';
        indicatorEl.appendChild(dot);
    });

    // Preload images (hidden)
    brands.forEach((brand, index) => {
        const img = document.createElement('img');
        img.src = brand.img;
        img.alt = brand.title;
        img.style.display = 'none';
        previewEl.appendChild(img);
    });

    // Register GSAP CustomEase
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
        "hop",
        "M0,0 C0.07,0.5,0.19,0.72,0.32,0.85 0.45,0.98,0.5,1,1,1"
    );

    const brandNames = Array.from(listEl.querySelectorAll('.brand-name'));
    const dotsContainer = indicatorEl;

    let activeIndex = -1;
    let activeImg = null;
    let activeWrapper = null;
    const listeners = [];

    // Update right-side indicator dots
    const updateDots = (idx) => {
        const dots = dotsContainer.querySelectorAll('.scroll-dot');
        dots.forEach((dot, i) => {
            if (i === idx) {
                gsap.to(dot, {
                    scaleX: 2.2,
                    opacity: 1,
                    duration: 0.2,
                    ease: "power2.out",
                });
                gsap.to(dot, { width: 20, duration: 0.2, ease: "power2.out" });
            } else {
                gsap.to(dot, {
                    scaleX: 1,
                    opacity: 0.5,
                    duration: 0.2,
                    ease: "power2.out",
                });
                gsap.to(dot, { width: 10, duration: 0.2, ease: "power2.out" });
            }
        });
    };

    const removeActivePreview = (force = false) => {
        if (!activeImg || !activeWrapper) return;
        if (!force) return;

        const imgToRemove = activeImg;
        const wrapperToRemove = activeWrapper;
        const prevIndex = activeIndex;

        activeImg = null;
        activeWrapper = null;
        activeIndex = -1;

        const prevAnchor = brandNames[prevIndex];
        if (prevAnchor) prevAnchor.classList.remove("active");

        gsap.to(imgToRemove, {
            opacity: 0,
            duration: 0.45,
            ease: "power1.out",
            onComplete: () => {
                if (wrapperToRemove && wrapperToRemove.parentNode)
                    wrapperToRemove.remove();
            },
        });
        updateDots(-1);
    };

    // Hover effect for brand names
    brandNames.forEach((brandEl, index) => {
        const brandImgSrc = brands[index].img;

        const handleMouseOver = () => {
            if (activeIndex === index) return;
            if (activeIndex !== -1) removeActivePreview(true);

            activeIndex = index;
            brandEl.classList.add("active");

            const wrapper = document.createElement("div");
            wrapper.className = "brand-img-wrapper";

            const img = document.createElement("img");
            img.src = brandImgSrc;
            img.alt = brandEl.textContent;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            img.style.display = "block";

            gsap.set(img, { scale: 1.25, opacity: 0 });
            gsap.set(wrapper, { clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)" });
            wrapper.appendChild(img);
            previewEl.appendChild(wrapper);

            activeImg = img;
            activeWrapper = wrapper;

            gsap.to(wrapper, {
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                duration: 0.5,
                ease: "hop",
            });
            gsap.to(img, { opacity: 1, duration: 0.25, ease: "power2.out" });
            gsap.to(img, { scale: 1, duration: 1.25, ease: "hop" });

            updateDots(index);
        };

        const handleMouseOut = (event) => {
            // ignore if moving into a child of the same anchor
            if (event.relatedTarget && brandEl.contains(event.relatedTarget)) return;

            // only animate out if this item is currently active
            if (!(activeImg && activeWrapper && activeIndex === index)) return;

            // remove active class immediately (keeps visual state consistent)
            brandEl.classList.remove("active");

            // capture references then clear active state so new hovers can start immediately
            const imgToRemove = activeImg;
            const wrapperToRemove = activeWrapper;
            activeImg = null;
            activeWrapper = null;
            activeIndex = -1;

            gsap.to(imgToRemove, {
                scale: 1.25,
                duration: 1.25,
                ease: "hop",
            });

            gsap.to(imgToRemove, {
                opacity: 0,
                duration: 0.5,
                ease: "hop",
            });

            gsap.to(wrapperToRemove, {
                duration: 0.5,
                ease: "hop",
                onComplete: () => {
                    if (wrapperToRemove && wrapperToRemove.parentNode) wrapperToRemove.remove();
                },
            });

            updateDots(-1);
        };

        brandEl.addEventListener("mouseover", handleMouseOver);
        brandEl.addEventListener("mouseout", handleMouseOut);

        listeners.push({ el: brandEl, over: handleMouseOver, out: handleMouseOut });
    });

    // Track scroll inside brand list
    let ticking = false;
    const onListScroll = () => {
        if (!listEl || ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            const listRect = listEl.getBoundingClientRect();
            const listCenterY = listRect.top + listRect.height / 2;

            let nearestIndex = -1;
            let nearestDistance = Infinity;

            brandNames.forEach((el, i) => {
                const r = el.getBoundingClientRect();
                const elCenterY = r.top + r.height / 2;
                const dist = Math.abs(elCenterY - listCenterY);
                if (dist < nearestDistance) {
                    nearestDistance = dist;
                    nearestIndex = i;
                }
            });

            if (nearestIndex !== -1 && nearestIndex !== activeIndex) {
                if (
                    listeners[nearestIndex] &&
                    typeof listeners[nearestIndex].over === "function"
                ) {
                    listeners[nearestIndex].over();
                }
            }

            ticking = false;
        });
    };

    if (listEl) listEl.addEventListener("scroll", onListScroll, { passive: true });

    // Handle wheel event to prevent page scroll when list is scrollable
    const handleWheel = (e) => {
        if (!listEl) return;

        const canScroll = listEl.scrollHeight > listEl.clientHeight;
        if (!canScroll) return; // allow normal section scroll

        // Prevent full-page scroll when list is scrollable
        e.preventDefault();
        e.stopPropagation();
    };

    listEl.addEventListener('wheel', handleWheel);
}
