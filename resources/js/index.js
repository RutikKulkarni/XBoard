(async function () {
  await Promise.all([init(), bootstrapCarouselEvent()]);
})();

async function init() {
  const accordion = document.getElementById("accordion");
  const id = ["One", "Two", "Three"];
  const accordionMarkup = [];

  for (let index = 0; index < magazines.length; index++) {
    const link = magazines[index];
    const title = ["Covid-19", "Space", "Sports"];
    const carouselId = ["carouselCovid-19", "carouselSpace", "carouselSports"];
    const isExpanded = index === 0;

    const cardBody = document.createElement("div");
    cardBody.className = "card-body m-0 p-0";

    const accordionDiv = document.createElement("div");
    accordionDiv.className = "accordion";
    accordionDiv.id = `heading${id[index]}`;

    const button = document.createElement("button");
    button.className = "btn p-0";
    button.dataset.bsToggle = "collapse";
    button.dataset.bsTarget = `#collapse${id[index]}`;
    button.setAttribute("aria-expanded", isExpanded);
    button.setAttribute("aria-controls", `collapse${id[index]}`);

    const accordionTitle = document.createElement("p");
    accordionTitle.className = "accordion-title";
    accordionTitle.innerHTML = `<i class="fas fa-angle-${
      isExpanded ? "up" : "down"
    }"></i>&nbsp;&nbsp;${title[index]}`;

    button.appendChild(accordionTitle);
    accordionDiv.appendChild(button);

    const collapseDiv = document.createElement("div");
    collapseDiv.className = `collapse ${isExpanded ? "show" : ""}`;
    collapseDiv.id = `collapse${id[index]}`;
    collapseDiv.setAttribute("aria-labelledby", `heading${id[index]}`);
    collapseDiv.dataset.bsParent = "#accordion";

    const data = await fetchMagazineData(link);
    const carousel = getCarouselMarkup(data, carouselId[index]);
    cardBody.innerHTML = carousel;

    collapseDiv.appendChild(cardBody);

    const card = document.createElement("div");
    card.className = "card border-0 w-100";
    card.appendChild(accordionDiv);
    card.appendChild(collapseDiv);

    accordionMarkup.push(card);
  }

  accordion.innerHTML = "";
  accordionMarkup.forEach((card) => accordion.appendChild(card));
}

async function fetchMagazineData(url) {
  const jsonUrl = "https://api.rss2json.com/v1/api.json?rss_url=" + url;

  try {
    const response = await fetch(jsonUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch data from ${jsonUrl}`);
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function getCardMarkup(item) {
  const date = new Date(item.pubDate);
  const published_date = date.toLocaleDateString("en-IN");

  return `
    <div class="card border-0 magazine-tile">
      <a href="${item.link}">
        <img class="img-fluid" src="${item.enclosure.link}" alt="${item.title}">
        <div class="card-body">
          <h4 class="card-title">${item.title}</h4>
          <p class="card-text"><small class="accordion-text">${item.author} <i class="fas fa-circle"></i> ${published_date}</small></p>
          <p class="card-summary">${item.description}</p>
        </div>
      </a>
    </div>`;
}

function getCarouselMarkup(items, carousel_id) {
  const carouselItems = items.map((item, index) => {
    const isActive = index === 0 ? "active" : "";
    const cardMarkup = getCardMarkup(item);

    return `
      <div class="carousel-item ${isActive}">
        ${cardMarkup}
      </div>
    `;
  });

  return `
    <div id="${carousel_id}" class="carousel slide">
      <div class="carousel-control right">
        <a class="carousel-control-prev-icon" href="#${carousel_id}" role="button" data-bs-slide="prev">
          <span aria-hidden="true"><i class="fas fa-angle-left"></i></span>
          <span class="sr-only">Previous</span>
        </a>
      </div>
      <div class="carousel-inner">
        ${carouselItems.join("")}
      </div>
      <div class="carousel-control right">
        <a class="carousel-control-next-icon" href="#${carousel_id}" role="button" data-bs-slide="next">
          <span aria-hidden="true"><i class="fas fa-angle-right"></i></span>
          <span class="sr-only">Next</span>
        </a>
      </div>
    </div>
  `;
}

function bootstrapCarouselEvent() {
  const carousels = document.querySelectorAll(".carousel");
  carousels.forEach((carousel) => {
    new bootstrap.Carousel(carousel, {
      interval: false,
      wrap: false,
    });
    carousel.addEventListener("slid.bs.carousel", function () {
      updateCarousel(this);
    });
  });

  const collapses = document.querySelectorAll(".collapse");
  collapses.forEach((collapse) => {
    collapse.addEventListener("hidden.bs.collapse", function () {
      const accordionIcon = this.previousElementSibling.querySelector(".fas");
      accordionIcon.classList.remove("fa-angle-up");
      accordionIcon.classList.add("fa-angle-down");
    });
    collapse.addEventListener("show.bs.collapse", function () {
      const accordionIcon = this.previousElementSibling.querySelector(".fas");
      accordionIcon.classList.remove("fa-angle-down");
      accordionIcon.classList.add("fa-angle-up");
    });
  });
  carousels.forEach((carousel) => {
    updateCarousel(carousel);
  });
}

function updateCarousel(ele) {
  const firstItem = ele.querySelector(
    ".carousel-inner .carousel-item:first-child"
  );
  const lastItem = ele.querySelector(
    ".carousel-inner .carousel-item:last-child"
  );
  const rightControl = ele.querySelector(".carousel-control.right");

  rightControl.style.display = firstItem.classList.contains("active")
    ? "block"
    : lastItem.classList.contains("active")
    ? "none"
    : "block";
}
