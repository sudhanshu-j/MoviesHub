$(document).ready(function () {
  // Wait until DOM is fully loaded

  const $carousel = $(".carousel"); // jQuery reference to the carousel element
  const banner = document.querySelector(".banner"); // Vanilla JS reference to banner
  const contents = document.querySelectorAll(".content"); // All movie content blocks
  const $indicators = $(".indicators"); // jQuery reference to indicators container

  // Add Resume Button and Paused Label dynamically to the banner
  $(".banner").append(`
    <button class="resume-btn btn-small" style="position: absolute; top: 20px; right: 20px; display: none; z-index: 10;">
      Resume Autoplay
    </button>
    <span class="paused-label" style="position: absolute; top: 20px; left: 20px; color: white; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 4px; display: none; z-index: 10;">
      Paused
    </span>
  `);

  // Cache jQuery selectors for later use
  const $resumeBtn = $(".resume-btn");
  const $pausedLabel = $(".paused-label");

  // List of movies used to set background and content
  const movies = [
    { bg: "bg-jurassic.jpg", title: "jurassic" },
    { bg: "bg-Mission-Impossible.jpg", title: "Mission-Impossible" },
    { bg: "bg-Sinners.jpg", title: "Sinners" },
    { bg: "bg-F1-The-Movie.jpg", title: "F1-The-Movie" },
    { bg: "bg-The-Last-Rodeo.png", title: "The-Last-Rodeo" },
    { bg: "bg-little-mermaid.jpg", title: "the-little-mermaid" },
    { bg: "bg-65.jpeg", title: "bg-65" },
    { bg: "bg-the-covenant.jpeg", title: "the-covenant" },
    { bg: "bg-the-black-demon.jpeg", title: "the-black-demon" },
    { bg: "bg-the-tank.jpeg", title: "the-tank" },
  ];

  let currentIndex = 0; // Tracks current carousel index
  let autoplayInterval = null; // Interval ID for autoplay
  let autoplayManuallyStopped = false; // Tracks if user manually stopped autoplay

  // Initialize Materialize carousel
  $carousel.carousel({
    duration: 200, // Animation speed
    fullWidth: false, // Not using full width mode
    noWrap: false, // Allows infinite loop
  });

  // Dynamically generate dot indicators based on movies array
  movies.forEach((_, i) => {
    $indicators.append(`<span data-index="${i}"></span>`);
  });

  const $dots = $indicators.find("span"); // Cache dot elements

  // Changes banner background and shows the relevant content block
  function changeBg(bg, title) {
    banner.style.background = `url('/images/movies/${bg}')`;
    banner.style.backgroundSize = "cover";
    banner.style.backgroundPosition = "center";

    contents.forEach((content) => {
      content.classList.remove("active"); // Hide all
      if (content.classList.contains(title)) {
        content.classList.add("active"); // Show only matching title
      }
    });
  }

  // Visually updates the active dot indicator
  function updateIndicators(index) {
    $dots.removeClass("active");
    $dots.eq(index).addClass("active");
  }

  // Move carousel to specific index and update display
  function goToIndex(index) {
    currentIndex = index;
    const movie = movies[index];
    changeBg(movie.bg, movie.title); // Update background + content
    updateIndicators(index); // Highlight dot
  }

  // Starts the automatic rotation
  function startAutoplay() {
    if (autoplayInterval || autoplayManuallyStopped) return; // Skip if already running or manually paused

    $pausedLabel.hide(); // Hide paused message
    $resumeBtn.hide(); // Hide resume button

    autoplayInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % movies.length; // Loop through movies
      $carousel.carousel("next"); // Animate to next slide
      goToIndex(currentIndex); // Update UI
    }, 4000);
  }

  // Stops the autoplay
  function stopAutoplay(manual = false) {
    clearInterval(autoplayInterval); // Kill interval
    autoplayInterval = null;

    if (manual) {
      autoplayManuallyStopped = true; // Remember user stopped it
      $pausedLabel.show(); // Show paused notice
      $resumeBtn.show(); // Show resume button
    }
  }

  // Clicking a dot jumps to the corresponding movie and stops autoplay
  $dots.on("click", function () {
    const i = $(this).data("index");
    currentIndex = i;
    $carousel.carousel("set", i);
    goToIndex(i);
    stopAutoplay(true); // Manual stop
  });

  // Track touch swipes on mobile for next/previous control
  let touchStartX = 0;
  let touchEndX = 0;

  $(".carousel-box")[0].addEventListener("touchstart", function (e) {
    touchStartX = e.changedTouches[0].screenX;
  });

  $(".carousel-box")[0].addEventListener("touchend", function (e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe(); // Check direction
  });

  function handleSwipe() {
    const swipeDistance = touchStartX - touchEndX;

    if (swipeDistance > 50) {
      // Swipe left → next
      currentIndex = (currentIndex + 1) % movies.length;
      $carousel.carousel("next");
      goToIndex(currentIndex);
    } else if (swipeDistance < -50) {
      // Swipe right → previous
      currentIndex = (currentIndex - 1 + movies.length) % movies.length;
      $carousel.carousel("prev");
      goToIndex(currentIndex);
    }

    // Restart autoplay if it wasn't manually stopped
    if (!autoplayManuallyStopped) {
      stopAutoplay(); // Soft stop
      startAutoplay(); // Soft resume
    }
  }

  // Pause autoplay when mouse hovers over any carousel item (only temporarily)
  $(".carousel-item").on("mouseenter", function () {
    if (!autoplayManuallyStopped) {
      stopAutoplay(false); // Soft pause
    }
  });

  // Resume autoplay on mouse leave if it wasn't manually paused
  $(".carousel-item").on("mouseleave", function () {
    if (!autoplayManuallyStopped) {
      startAutoplay(); // Soft resume
    }
  });

  // Stop autoplay permanently if a carousel item is clicked
  $(".carousel-item").on("click", function () {
    const index = $(this).index();
    currentIndex = index;
    $carousel.carousel("set", index);
    goToIndex(index);
    stopAutoplay(true); // Manual pause
  });

  // Clicking Resume button re-enables autoplay
  $resumeBtn.on("click", function () {
    autoplayManuallyStopped = false; // Clear manual pause flag
    startAutoplay();
  });

  // Initial load: display first movie and start autoplay
  goToIndex(currentIndex);
  startAutoplay();
});
