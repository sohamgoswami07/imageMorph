import './App.css'
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import CustomEase from "gsap/CustomEase";
import { brands } from "./assets/data/BrandData.js";

function App() {
  const listRef = useRef(null);
  const previewRef = useRef(null);
  const indicatorRef = useRef(null);
  const sidePanelRef = useRef(null);
  const overlayRef = useRef(null);

  // Handle scroll only inside brand list if scrollable
  const handleWheel = (e) => {
    const el = listRef.current;
    if (!el) return;

    const canScroll = el.scrollHeight > el.clientHeight;
    if (!canScroll) return; // allow normal section scroll

    // Prevent full-page scroll when list is scrollable
    e.preventDefault();
    e.stopPropagation();
  };

  // Animate panel in and overlay
  const openSidePanel = (brand) => {
    setSelectedBrand(brand);
    setIsPanelOpen(true);

    // ensure next tick for DOM to mount
    requestAnimationFrame(() => {
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0, pointerEvents: "none" },
          { opacity: 0.45, duration: 0.35, pointerEvents: "auto", ease: "power2.out" }
        );
      }

      if (sidePanelRef.current) {
        gsap.fromTo(
          sidePanelRef.current,
          { x: "100%" },
          { x: "0%", duration: 0.5, ease: "power3.out" }
        );

        // small content fade/slide
        gsap.fromTo(
          sidePanelRef.current.querySelectorAll(".panel-content > *"),
          { y: 12, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power2.out", delay: 0.08 }
        );
      }
    });
  };

  // Handle brand click to open side panel
  const handleBrandClick = (e, brand) => {
    e.preventDefault();
    openSidePanel(brand);
  };

  useEffect(() => {
    gsap.registerPlugin(CustomEase);
    CustomEase.create(
      "hop",
      "M0,0 C0.07,0.5,0.19,0.72,0.32,0.85 0.45,0.98,0.5,1,1,1"
    );

    const brandsPreview = previewRef.current;
    const brandNames = listRef.current
      ? Array.from(listRef.current.querySelectorAll(".brand-name"))
      : [];
    const dotsContainer = indicatorRef.current;

    if (!brandsPreview || brandNames.length === 0 || !dotsContainer) return;

    let activeIndex = -1;
    let activeImg = null;
    let activeWrapper = null;
    const listeners = [];

    // Update right-side indicator dots
    const updateDots = (idx) => {
      const dots = dotsContainer.querySelectorAll(".scroll-dot");
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
      const brandImgSrc =
        brands && brands[index] && brands[index].img
          ? brands[index].img
          : `img${index + 1}.jpg`;

      const handleMouseOver = () => {
        if (activeIndex === index) return;
        if (activeIndex !== -1) removeActivePreview(true);

        activeIndex = index;
        brandEl.classList.add("active");

        const wrapper = document.createElement("div");
        wrapper.className = "brand-img-wrapper pointer-events-none absolute inset-0";

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
        brandsPreview.appendChild(wrapper);

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
    const listEl = listRef.current;
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

    return () => {
      listeners.forEach(({ el, over, out }) => {
        el.removeEventListener("mouseover", over);
        el.removeEventListener("mouseout", out);
      });
      if (listEl) listEl.removeEventListener("scroll", onListScroll);
      if (brandsPreview) brandsPreview.innerHTML = "";
    };
  }, []);
  return (
    <>
    <section className="snap-start relative h-screen w-full p-4 md:p-16 bg-[#ededed] flex items-stretch">
      {/* Left: brands list */}
      <div
        className="absolute top-1/2 -translate-y-1/2 z-10 overflow-y-auto no-scrollbar mix-blend-difference text-[#ededed]"
        onWheel={handleWheel}
        ref={listRef}
      >
        {brands.map((brand, index) => (
          <a
            key={index}
            href={brand.link}
            onClick={(e) => handleBrandClick(e, brand)}
            className="brand-name block font-semibold leading-tight my-4 md:my-6 cursor-pointer"
          >
            {brand.title}
          </a>
        ))}
      </div>

      {/* Right: preview area */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[85%] md:h-[75%] w-[75%] md:w-[65%] overflow-hidden"
        ref={previewRef}
      >
        {brands.map((brand, i) => (
          <img key={i} src={brand.img} alt={brand.title} style={{ display: "none" }} />
        ))}
      </div>

      {/* Right-side scroll indicator */}
      <div
        ref={indicatorRef}
        className="absolute top-1/2 right-4 md:right-16 -translate-y-1/2 flex flex-col items-right gap-4 z-10 w-0"
        aria-hidden
      >
        {brands.map((_, i) => (
          <div
            key={i}
            className="scroll-dot transform origin-right transition-all duration-150 bg-[#111111] self-center"
            style={{ width: 10, height: 1 }}
          />
        ))}
      </div>
    </section>
    </>
  )
}

export default App
